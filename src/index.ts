import { BOOKS, findBook, findProduct, productsFor, type Product } from "./catalog";
import { hmacHex, randomToken, sha256Hex, timingSafeEqual } from "./crypto";

interface Env {
  DB: D1Database;
  EBOOKS: R2Bucket;
  ASSETS: Fetcher;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  STORE_NAME?: string;
  SUPPORT_EMAIL?: string;
  DOWNLOAD_TTL_HOURS?: string;
  DOWNLOAD_LIMIT?: string;
  PRICE_SINGLE_PAISE?: string;
  PRICE_LANGUAGE_BUNDLE_PAISE?: string;
  PRICE_COMPLETE_BUNDLE_PAISE?: string;
}

interface OrderRow {
  id: string;
  razorpay_order_id: string;
  product_id: string;
  amount: number;
  currency: string;
  buyer_email: string;
  buyer_name: string | null;
  recovery_hash: string;
  status: "pending" | "paid" | "failed" | "refunded";
  payment_id: string | null;
  created_at: number;
  updated_at: number;
  paid_at: number | null;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
}

interface PaymentEntity extends RazorpayPayment {
  entity?: string;
}

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "request_error",
  ) {
    super(message);
  }
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function withSecurityHeaders(response: Response): Response {
  const secured = new Response(response.body, response);
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("x-frame-options", "DENY");
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  secured.headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self' https://checkout.razorpay.com; style-src 'self'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  );
  return secured;
}

function positiveInteger(value: string | undefined, fallback: number, maximum: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}

function configured(value: string | undefined): value is string {
  return Boolean(value && value !== "replace_me" && !value.includes("replace_me"));
}

function requireRazorpay(env: Env): { keyId: string; keySecret: string } {
  if (!configured(env.RAZORPAY_KEY_ID) || !configured(env.RAZORPAY_KEY_SECRET)) {
    throw new HttpError(503, "Checkout is being configured. Please try again shortly.", "checkout_unavailable");
  }
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

async function readJson<T>(request: Request): Promise<T> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 16_384) throw new HttpError(413, "Request is too large.");
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Expected a JSON request.");
  }
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

function cleanEmail(value: unknown): string {
  if (typeof value !== "string") throw new HttpError(400, "Enter a valid email address.", "invalid_email");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Enter a valid email address.", "invalid_email");
  }
  return email;
}

function cleanName(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, "Name must be text.");
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > 80) throw new HttpError(400, "Name must be 80 characters or fewer.");
  return name;
}

async function razorpayRequest<T>(env: Env, path: string, init: RequestInit = {}): Promise<T> {
  const { keyId, keySecret } = requireRazorpay(env);
  const headers = new Headers(init.headers);
  headers.set("authorization", `Basic ${btoa(`${keyId}:${keySecret}`)}`);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");

  const response = await fetch(`https://api.razorpay.com/v1${path}`, { ...init, headers });
  if (!response.ok) {
    console.error("Razorpay API error", response.status, await response.text());
    throw new HttpError(502, "Payment service did not respond. Please try again.", "payment_service_error");
  }
  return (await response.json()) as T;
}

async function createOrder(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ productId?: unknown; email?: unknown; name?: unknown }>(request);
  if (typeof body.productId !== "string") throw new HttpError(400, "Choose a valid product.", "invalid_product");
  const product = findProduct(body.productId, env);
  if (!product) throw new HttpError(400, "Choose a valid product.", "invalid_product");

  const email = cleanEmail(body.email);
  const name = cleanName(body.name);
  const recoverySecret = randomToken();
  const recoveryHash = await sha256Hex(recoverySecret);
  const localId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  const razorpayOrder = await razorpayRequest<RazorpayOrder>(env, "/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: product.amount,
      currency: product.currency,
      receipt: `ebook_${localId.replace(/-/g, "").slice(0, 26)}`,
      notes: { product_id: product.id, buyer_email: email },
    }),
  });

  if (
    !razorpayOrder.id ||
    razorpayOrder.amount !== product.amount ||
    razorpayOrder.currency !== product.currency
  ) {
    throw new HttpError(502, "Payment order could not be confirmed.", "payment_service_error");
  }

  await env.DB.prepare(
    `INSERT INTO orders
      (id, razorpay_order_id, product_id, amount, currency, buyer_email, buyer_name,
       recovery_hash, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
  )
    .bind(
      localId,
      razorpayOrder.id,
      product.id,
      product.amount,
      product.currency,
      email,
      name,
      recoveryHash,
      now,
      now,
    )
    .run();

  return json({
    keyId: requireRazorpay(env).keyId,
    orderId: razorpayOrder.id,
    productId: product.id,
    productName: product.name,
    amount: product.amount,
    currency: product.currency,
    email,
    name,
    recoverySecret,
  });
}

async function getStoredOrder(env: Env, razorpayOrderId: string): Promise<OrderRow> {
  const order = await env.DB.prepare("SELECT * FROM orders WHERE razorpay_order_id = ?")
    .bind(razorpayOrderId)
    .first<OrderRow>();
  if (!order) throw new HttpError(404, "Purchase record was not found.", "order_not_found");
  return order;
}

async function issueGrant(env: Env, order: OrderRow): Promise<{
  token: string;
  expiresAt: number;
  downloads: Array<{ id: string; title: string; language: string; url: string }>;
}> {
  if (order.status === "refunded") throw new HttpError(403, "This purchase has been refunded.", "refunded");
  const product = findProduct(order.product_id, env);
  if (!product) throw new HttpError(500, "Product mapping is unavailable.");

  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const grantId = `grant:${order.id}`;
  const now = Math.floor(Date.now() / 1000);
  const ttlHours = positiveInteger(env.DOWNLOAD_TTL_HOURS, 168, 24 * 30);
  const expiresAt = now + ttlHours * 3600;

  const statements = [
    env.DB.prepare(
      `INSERT INTO download_grants (id, order_id, token_hash, expires_at, revoked, created_at)
       VALUES (?, ?, ?, ?, 0, ?)
       ON CONFLICT(order_id) DO UPDATE SET
         token_hash = excluded.token_hash,
         expires_at = excluded.expires_at,
         revoked = 0,
         created_at = excluded.created_at`,
    ).bind(grantId, order.id, tokenHash, expiresAt, now),
    env.DB.prepare("DELETE FROM grant_items WHERE grant_id = ?").bind(grantId),
    ...product.bookIds.map((bookId) =>
      env.DB.prepare("INSERT INTO grant_items (grant_id, book_id, downloads) VALUES (?, ?, 0)").bind(
        grantId,
        bookId,
      ),
    ),
  ];
  await env.DB.batch(statements);

  const downloads = product.bookIds.map((bookId) => {
    const book = findBook(bookId);
    if (!book) throw new HttpError(500, "Book mapping is unavailable.");
    return {
      id: book.id,
      title: book.title,
      language: book.language,
      url: `/download/${token}/${book.id}`,
    };
  });
  return { token, expiresAt, downloads };
}

async function verifyPayment(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{
    razorpay_order_id?: unknown;
    razorpay_payment_id?: unknown;
    razorpay_signature?: unknown;
  }>(request);
  if (
    typeof body.razorpay_order_id !== "string" ||
    typeof body.razorpay_payment_id !== "string" ||
    typeof body.razorpay_signature !== "string"
  ) {
    throw new HttpError(400, "Payment response is incomplete.", "invalid_payment_response");
  }
  if (!/^order_[A-Za-z0-9]+$/.test(body.razorpay_order_id) || !/^pay_[A-Za-z0-9]+$/.test(body.razorpay_payment_id)) {
    throw new HttpError(400, "Payment response is invalid.", "invalid_payment_response");
  }

  const order = await getStoredOrder(env, body.razorpay_order_id);
  if (order.status === "refunded") throw new HttpError(403, "This purchase has been refunded.", "refunded");

  const { keySecret } = requireRazorpay(env);
  const expectedSignature = await hmacHex(
    keySecret,
    `${order.razorpay_order_id}|${body.razorpay_payment_id}`,
  );
  if (!timingSafeEqual(expectedSignature, body.razorpay_signature)) {
    throw new HttpError(400, "Payment signature could not be verified.", "invalid_signature");
  }

  const payment = await razorpayRequest<RazorpayPayment>(env, `/payments/${body.razorpay_payment_id}`);
  if (
    payment.id !== body.razorpay_payment_id ||
    payment.order_id !== order.razorpay_order_id ||
    payment.amount !== order.amount ||
    payment.currency !== order.currency
  ) {
    throw new HttpError(400, "Payment details do not match this order.", "payment_mismatch");
  }
  if (payment.status !== "captured" || !payment.captured) {
    throw new HttpError(409, "Payment is still processing. Use ‘Restore purchase’ in a moment.", "payment_processing");
  }

  const now = Math.floor(Date.now() / 1000);
  const update = await env.DB.prepare(
    `UPDATE orders SET status = 'paid', payment_id = ?, paid_at = COALESCE(paid_at, ?), updated_at = ?
     WHERE id = ? AND status != 'refunded' AND (payment_id IS NULL OR payment_id = ?)`,
  )
    .bind(payment.id, now, now, order.id, payment.id)
    .run();
  if (update.meta.changes !== 1) throw new HttpError(409, "This payment is linked to another purchase.");

  const paidOrder = { ...order, status: "paid" as const, payment_id: payment.id, paid_at: now };
  return json({ success: true, ...(await issueGrant(env, paidOrder)) });
}

async function restoreAccess(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ orderId?: unknown; recoverySecret?: unknown }>(request);
  if (typeof body.orderId !== "string" || typeof body.recoverySecret !== "string") {
    throw new HttpError(400, "Recovery details are incomplete.");
  }
  const order = await getStoredOrder(env, body.orderId);
  const suppliedHash = await sha256Hex(body.recoverySecret);
  if (!timingSafeEqual(order.recovery_hash, suppliedHash)) {
    throw new HttpError(403, "Recovery details do not match.", "invalid_recovery");
  }
  if (order.status !== "paid") {
    const message = order.status === "refunded" ? "This purchase has been refunded." : "Payment is not confirmed yet.";
    throw new HttpError(409, message, order.status);
  }
  return json({ success: true, ...(await issueGrant(env, order)) });
}

function paymentFromWebhook(payload: Record<string, unknown>): PaymentEntity | null {
  const container = payload.payment;
  if (!container || typeof container !== "object") return null;
  const entity = (container as Record<string, unknown>).entity;
  return entity && typeof entity === "object" ? (entity as PaymentEntity) : null;
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (!configured(env.RAZORPAY_WEBHOOK_SECRET)) {
    throw new HttpError(503, "Webhook secret is not configured.");
  }
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(expected, signature)) throw new HttpError(400, "Invalid webhook signature.");

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Invalid webhook payload.");
  }
  const eventType = typeof payload.event === "string" ? payload.event : "unknown";
  const eventId = request.headers.get("x-razorpay-event-id") ?? (await sha256Hex(rawBody));
  const now = Math.floor(Date.now() / 1000);

  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO webhook_events (event_id, event_type, processed_at) VALUES (?, ?, ?)",
  )
    .bind(eventId, eventType, now)
    .run();
  if (inserted.meta.changes === 0) return json({ received: true, duplicate: true });

  try {
    const payment = paymentFromWebhook(payload);
    if (eventType === "payment.captured" && payment?.order_id) {
      const order = await env.DB.prepare("SELECT * FROM orders WHERE razorpay_order_id = ?")
        .bind(payment.order_id)
        .first<OrderRow>();
      if (order) {
        if (payment.amount !== order.amount || payment.currency !== order.currency) {
          throw new Error("Captured webhook amount or currency mismatch");
        }
        await env.DB.prepare(
          `UPDATE orders SET status = 'paid', payment_id = ?, paid_at = COALESCE(paid_at, ?), updated_at = ?
           WHERE id = ? AND status != 'refunded'`,
        )
          .bind(payment.id, now, now, order.id)
          .run();
      }
    } else if (eventType === "payment.failed" && payment?.order_id) {
      await env.DB.prepare(
        "UPDATE orders SET status = 'failed', updated_at = ? WHERE razorpay_order_id = ? AND status = 'pending'",
      )
        .bind(now, payment.order_id)
        .run();
    } else if ((eventType === "payment.refunded" || eventType === "refund.processed") && payment?.id) {
      const order = await env.DB.prepare("SELECT id FROM orders WHERE payment_id = ?")
        .bind(payment.id)
        .first<{ id: string }>();
      if (order) {
        await env.DB.batch([
          env.DB.prepare("UPDATE orders SET status = 'refunded', updated_at = ? WHERE id = ?").bind(now, order.id),
          env.DB.prepare("UPDATE download_grants SET revoked = 1 WHERE order_id = ?").bind(order.id),
        ]);
      }
    }
  } catch (error) {
    await env.DB.prepare("DELETE FROM webhook_events WHERE event_id = ?").bind(eventId).run();
    throw error;
  }

  return json({ received: true });
}

async function downloadBook(pathname: string, env: Env): Promise<Response> {
  const match = pathname.match(/^\/download\/([A-Za-z0-9_-]{40,80})\/([a-z0-9-]{3,80})$/);
  if (!match) throw new HttpError(404, "Download link was not found.", "not_found");
  const [, token, bookId] = match;
  const book = findBook(bookId);
  if (!book) throw new HttpError(404, "Book was not found.", "not_found");

  const tokenHash = await sha256Hex(token);
  const grant = await env.DB.prepare(
    `SELECT g.id, g.expires_at, g.revoked, gi.downloads, o.status
     FROM download_grants g
     JOIN grant_items gi ON gi.grant_id = g.id
     JOIN orders o ON o.id = g.order_id
     WHERE g.token_hash = ? AND gi.book_id = ?`,
  )
    .bind(tokenHash, bookId)
    .first<{ id: string; expires_at: number; revoked: number; downloads: number; status: string }>();

  const now = Math.floor(Date.now() / 1000);
  if (!grant || grant.revoked || grant.status !== "paid" || grant.expires_at < now) {
    throw new HttpError(403, "This download link is invalid or has expired.", "download_denied");
  }
  const limit = positiveInteger(env.DOWNLOAD_LIMIT, 3, 20);
  if (grant.downloads >= limit) {
    throw new HttpError(429, "This file has reached its download limit.", "download_limit");
  }

  const object = await env.EBOOKS.get(book.objectKey);
  if (!object) {
    console.error("Missing protected ebook object", book.objectKey);
    throw new HttpError(503, "This file is temporarily unavailable.", "file_unavailable");
  }
  const counted = await env.DB.prepare(
    "UPDATE grant_items SET downloads = downloads + 1 WHERE grant_id = ? AND book_id = ? AND downloads < ?",
  )
    .bind(grant.id, bookId, limit)
    .run();
  if (counted.meta.changes !== 1) throw new HttpError(429, "This file has reached its download limit.");

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", "application/pdf");
  headers.set("content-disposition", `attachment; filename="${book.fileName}"`);
  headers.set("content-length", String(object.size));
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}

function publicProduct(product: Product): Product & { displayPrice: string } {
  return {
    ...product,
    displayPrice: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(product.amount / 100),
  };
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === "GET" && pathname === "/api/catalog") {
    return json({
      storeName: env.STORE_NAME ?? "Seedhi Baat Guides",
      supportEmail: env.SUPPORT_EMAIL?.endsWith(".invalid") ? null : env.SUPPORT_EMAIL,
      books: BOOKS,
      products: productsFor(env).map(publicProduct),
    });
  }
  if (request.method === "GET" && pathname === "/api/health") {
    return json({
      ok: true,
      checkoutConfigured: configured(env.RAZORPAY_KEY_ID) && configured(env.RAZORPAY_KEY_SECRET),
      webhookConfigured: configured(env.RAZORPAY_WEBHOOK_SECRET),
    });
  }
  if (request.method === "POST" && pathname === "/api/orders") return createOrder(request, env);
  if (request.method === "POST" && pathname === "/api/payments/verify") return verifyPayment(request, env);
  if (request.method === "POST" && pathname === "/api/access") return restoreAccess(request, env);
  if (request.method === "POST" && pathname === "/api/webhooks/razorpay") return handleWebhook(request, env);
  if (request.method === "GET" && pathname.startsWith("/download/")) return downloadBook(pathname, env);
  if (pathname.startsWith("/api/") || pathname.startsWith("/download/")) {
    throw new HttpError(404, "Not found.", "not_found");
  }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return withSecurityHeaders(await route(request, env));
    } catch (error) {
      if (error instanceof HttpError) {
        return withSecurityHeaders(json({ error: error.message, code: error.code }, error.status));
      }
      console.error("Unhandled storefront error", error);
      return withSecurityHeaders(json({ error: "Something went wrong. Please try again.", code: "server_error" }, 500));
    }
  },
} satisfies ExportedHandler<Env>;
