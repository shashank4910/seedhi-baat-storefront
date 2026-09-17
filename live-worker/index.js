var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/catalog.ts
var topics = [
  {
    slug: "manipulation",
    topic: "Boundaries",
    roman: "Manipulation Se Kaise Bachein",
    hindi: "\u092E\u0948\u0928\u093F\u092A\u0941\u0932\u0947\u0936\u0928 \u0938\u0947 \u0915\u0948\u0938\u0947 \u092C\u091A\u0947\u0902",
    description: "Pressure, guilt, gaslighting aur unfair demands ko pehchaan kar seedha jawab dena.",
    hindiDescription: "\u0926\u092C\u093E\u0935, \u0905\u092A\u0930\u093E\u0927\u092C\u094B\u0927, \u0917\u0948\u0938\u0932\u093E\u0907\u091F\u093F\u0902\u0917 \u0914\u0930 \u0905\u0928\u0941\u091A\u093F\u0924 \u092E\u093E\u0901\u0917\u094B\u0902 \u0915\u094B \u092A\u0939\u091A\u093E\u0928\u0915\u0930 \u0938\u093E\u092B\u093C \u091C\u0935\u093E\u092C \u0926\u0947\u0928\u093E\u0964",
    accent: "#c94f6d",
    fileName: "01_Manipulation_Se_Kaise_Bachein.pdf",
    hinglishPages: 19,
    hindiPages: 19
  },
  {
    slug: "conversation",
    topic: "Conversation",
    roman: "Baat Karna Seekho",
    hindi: "\u092C\u093E\u0924 \u0915\u0930\u0928\u093E \u0938\u0940\u0916\u094B",
    description: "Awkward silence se thoughtful sawaal, listening aur natural conversation tak.",
    hindiDescription: "\u091D\u093F\u091D\u0915 \u0938\u0947 \u0906\u0917\u0947 \u092C\u0922\u093C\u0915\u0930 \u0905\u091A\u094D\u091B\u0947 \u0938\u0935\u093E\u0932, \u0927\u094D\u092F\u093E\u0928 \u0938\u0947 \u0938\u0941\u0928\u0928\u093E \u0914\u0930 \u0938\u0939\u091C \u092C\u093E\u0924\u091A\u0940\u0924 \u0915\u0930\u0928\u093E\u0964",
    accent: "#168b83",
    fileName: "02_Baat_Karna_Seekho.pdf",
    hinglishPages: 18,
    hindiPages: 17
  },
  {
    slug: "people",
    topic: "People",
    roman: "Logon Ko Samajhna Seekho",
    hindi: "\u0932\u094B\u0917\u094B\u0902 \u0915\u094B \u0938\u092E\u091D\u0928\u093E \u0938\u0940\u0916\u094B",
    description: "Ek incident par nahi, repeated behaviour aur context par logon ko samajhna.",
    hindiDescription: "\u090F\u0915 \u0918\u091F\u0928\u093E \u0928\u0939\u0940\u0902, \u092C\u093E\u0930-\u092C\u093E\u0930 \u0926\u093F\u0916\u0928\u0947 \u0935\u093E\u0932\u0947 \u0935\u094D\u092F\u0935\u0939\u093E\u0930 \u0914\u0930 \u092A\u0930\u093F\u0938\u094D\u0925\u093F\u0924\u093F \u0938\u0947 \u0932\u094B\u0917\u094B\u0902 \u0915\u094B \u0938\u092E\u091D\u0928\u093E\u0964",
    accent: "#5965ad",
    fileName: "03_Logon_Ko_Samajhna_Seekho.pdf",
    hinglishPages: 19,
    hindiPages: 19
  },
  {
    slug: "attraction",
    topic: "Connection",
    roman: "Attraction Aur Connection",
    hindi: "\u0906\u0915\u0930\u094D\u0937\u0923 \u0914\u0930 \u0915\u0928\u0947\u0915\u094D\u0936\u0928",
    description: "Mutual interest, pace, consent aur healthy connection ko practical nazar se dekhna.",
    hindiDescription: "\u0906\u092A\u0938\u0940 \u0930\u0941\u091A\u093F, \u0938\u0939\u0940 \u0930\u092B\u093C\u094D\u0924\u093E\u0930, \u0938\u0939\u092E\u0924\u093F \u0914\u0930 \u0938\u094D\u0935\u0938\u094D\u0925 \u091C\u0941\u0921\u093C\u093E\u0935 \u0915\u094B \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u0928\u091C\u093C\u0930 \u0938\u0947 \u0926\u0947\u0916\u0928\u093E\u0964",
    accent: "#bd6546",
    fileName: "04_Attraction_Aur_Connection.pdf",
    hinglishPages: 18,
    hindiPages: 17
  },
  {
    slug: "office",
    topic: "Workplace",
    roman: "Office Mein Apni Baat Kaise Rakhein",
    hindi: "\u0911\u092B\u093C\u093F\u0938 \u092E\u0947\u0902 \u0905\u092A\u0928\u0940 \u092C\u093E\u0924 \u0915\u0948\u0938\u0947 \u0930\u0916\u0947\u0902",
    description: "Meetings, feedback, workload aur difficult colleagues ke liye ready scripts.",
    hindiDescription: "\u092E\u0940\u091F\u093F\u0902\u0917, \u092B\u0940\u0921\u092C\u0948\u0915, \u0915\u093E\u092E \u0915\u0947 \u092C\u094B\u091D \u0914\u0930 \u092E\u0941\u0936\u094D\u0915\u093F\u0932 \u0938\u0939\u0915\u0930\u094D\u092E\u093F\u092F\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0924\u0948\u092F\u093E\u0930 \u0935\u093E\u0915\u094D\u092F\u0964",
    accent: "#337053",
    fileName: "05_Office_Mein_Apni_Baat_Kaise_Rakhein.pdf",
    hinglishPages: 19,
    hindiPages: 19
  }
];
var IDEA_GUIDE = {
  id: "ideas-25-under-2k",
  topic: "Home Business",
  title: "25 Business Ideas with AI \u2014 Implementation Guide",
  language: "Hinglish",
  description: "25 AI-assisted home businesses with a full implementation guide: deliverables, starter prices, 50 copy-paste prompts, customer messages and a 7-day first-customer plan.",
  accent: "#e8930c",
  pages: 65,
  fileName: "25_Business_Ideas_Under_2000_Implementation_Guide.pdf",
  objectKey: "ideas/25_Business_Ideas_Under_2000_Implementation_Guide.pdf"
};
var AI_PRO_GUIDE = {
  id: "ai-pro-guide",
  topic: "AI Skills",
  title: "Use AI Like a Pro \u2014 Beginner's Guide",
  language: "Hinglish",
  description: "The complete beginner's guide to confident everyday AI: brief the tool, improve answers, check facts and finish real work. 24 chapters, 50+ copy-adapt prompts, worked examples for shop owners, teachers, HR, students and more.",
  accent: "#17675f",
  pages: 59,
  fileName: "Use_AI_Like_A_Pro_Beginners_Guide.pdf",
  objectKey: "ai-pro/Use_AI_Like_A_Pro_Beginners_Guide.pdf"
};
var PSYCHOLOGY_BOOKS = topics.flatMap((topic) => [
  {
    id: `${topic.slug}-hinglish`,
    topic: topic.topic,
    title: topic.roman,
    language: "Hinglish",
    description: topic.description,
    accent: topic.accent,
    pages: topic.hinglishPages,
    fileName: topic.fileName,
    objectKey: `hinglish/${topic.fileName}`
  },
  {
    id: `${topic.slug}-hindi`,
    topic: topic.topic,
    title: topic.hindi,
    language: "Hindi",
    description: topic.hindiDescription,
    accent: topic.accent,
    pages: topic.hindiPages,
    fileName: topic.fileName,
    objectKey: `hindi/${topic.fileName}`
  }
]);
var BOOKS = [...PSYCHOLOGY_BOOKS, IDEA_GUIDE, AI_PRO_GUIDE];
function positivePrice(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}
__name(positivePrice, "positivePrice");
function productsFor(env) {
  const single = positivePrice(env.PRICE_SINGLE_PAISE, 19900);
  const languageBundle = positivePrice(env.PRICE_LANGUAGE_BUNDLE_PAISE, 69900);
  const completeBundle = positivePrice(env.PRICE_COMPLETE_BUNDLE_PAISE, 99900);
  const ideasGuide = positivePrice(env.PRICE_IDEAS_GUIDE_PAISE, 19900);
  const aiPro = positivePrice(env.PRICE_AI_PRO_PAISE, 29900);
  const ideasPlusAiPro = positivePrice(env.PRICE_IDEAS_AI_PRO_BUNDLE_PAISE, 49900);
  const hinglishIds = PSYCHOLOGY_BOOKS.filter((book) => book.language === "Hinglish").map((book) => book.id);
  const hindiIds = PSYCHOLOGY_BOOKS.filter((book) => book.language === "Hindi").map((book) => book.id);
  return [
    ...PSYCHOLOGY_BOOKS.map((book) => ({
      id: book.id,
      name: book.title,
      description: book.description,
      kind: "single",
      language: book.language,
      amount: single,
      currency: "INR",
      bookIds: [book.id]
    })),
    {
      id: "bundle-hinglish",
      name: "Hinglish Complete Set",
      description: "Saare 5 practical guides \u2014 500 real-life situations, one library.",
      kind: "bundle",
      language: "Hinglish",
      badge: "Save \u20B9296",
      amount: languageBundle,
      currency: "INR",
      bookIds: hinglishIds
    },
    {
      id: "bundle-hindi",
      name: "\u0938\u0902\u092A\u0942\u0930\u094D\u0923 \u0939\u093F\u0902\u0926\u0940 \u0938\u0902\u0917\u094D\u0930\u0939",
      description: "\u0938\u092D\u0940 5 \u0935\u094D\u092F\u093E\u0935\u0939\u093E\u0930\u093F\u0915 \u0917\u093E\u0907\u0921 \u2014 \u0930\u094B\u091C\u093C\u092E\u0930\u094D\u0930\u093E \u0915\u0940 500 \u0938\u094D\u0925\u093F\u0924\u093F\u092F\u093E\u0901, \u090F\u0915 \u0938\u093E\u0925\u0964",
      kind: "bundle",
      language: "Hindi",
      badge: "\u20B9296 \u0915\u0940 \u092C\u091A\u0924",
      amount: languageBundle,
      currency: "INR",
      bookIds: hindiIds
    },
    {
      id: "bundle-complete",
      name: "Complete 10-book Library",
      description: "Every guide in Hinglish and Hindi. Buy once, choose either language anytime.",
      kind: "bundle",
      language: "Both",
      badge: "Best value \xB7 Save \u20B9991",
      amount: completeBundle,
      currency: "INR",
      bookIds: [...hinglishIds, ...hindiIds]
    },
    {
      id: "ideas-25-under-2k",
      name: IDEA_GUIDE.title,
      description: IDEA_GUIDE.description,
      kind: "single",
      language: "Hinglish",
      badge: "Launch offer",
      amount: ideasGuide,
      currency: "INR",
      bookIds: [IDEA_GUIDE.id]
    },
    {
      id: "ai-pro-guide",
      name: AI_PRO_GUIDE.title,
      description: AI_PRO_GUIDE.description,
      kind: "single",
      language: "Hinglish",
      badge: "Most useful with the ideas book",
      amount: aiPro,
      currency: "INR",
      bookIds: [AI_PRO_GUIDE.id]
    },
    {
      id: "bundle-ideas-ai-pro",
      name: "Home Business Starter Pack \u2014 both books",
      description: "25 Business Ideas with AI + Use AI Like a Pro. The ideas to sell and the AI skills to deliver them \u2014 Rs. 99 less than buying separately.",
      kind: "bundle",
      language: "Hinglish",
      badge: "Save Rs. 99",
      amount: ideasPlusAiPro,
      currency: "INR",
      bookIds: [IDEA_GUIDE.id, AI_PRO_GUIDE.id]
    }
  ];
}
__name(productsFor, "productsFor");
function findBook(bookId) {
  return BOOKS.find((book) => book.id === bookId);
}
__name(findBook, "findBook");
function findProduct(productId, env) {
  return productsFor(env).find((product) => product.id === productId);
}
__name(findProduct, "findProduct");

// src/crypto.ts
var encoder = new TextEncoder();
function bytesToHex(bytes) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
__name(bytesToHex, "bytesToHex");
async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}
__name(hmacHex, "hmacHex");
async function sha256Hex(value) {
  return bytesToHex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}
__name(sha256Hex, "sha256Hex");
function timingSafeEqual(left, right) {
  const a = left.toLowerCase();
  const b = right.toLowerCase();
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(randomToken, "randomToken");

// src/index.ts
var PSYCHOLOGY_BOOK_COUNT = 10;
var HttpError = class extends Error {
  constructor(status, message, code = "request_error") {
    super(message);
    this.status = status;
    this.code = code;
  }
  static {
    __name(this, "HttpError");
  }
};
var JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
__name(json, "json");
function withSecurityHeaders(response) {
  const secured = new Response(response.body, response);
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("x-frame-options", "DENY");
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  secured.headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self' https://checkout.razorpay.com https://connect.facebook.net; style-src 'self'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://www.facebook.com https://connect.facebook.net; frame-src https://api.razorpay.com https://checkout.razorpay.com; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
  );
  return secured;
}
__name(withSecurityHeaders, "withSecurityHeaders");
function positiveInteger(value, fallback, maximum) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : fallback;
}
__name(positiveInteger, "positiveInteger");
function configured(value) {
  return Boolean(value && value !== "replace_me" && !value.includes("replace_me"));
}
__name(configured, "configured");
function requireRazorpay(env) {
  if (!configured(env.RAZORPAY_KEY_ID) || !configured(env.RAZORPAY_KEY_SECRET)) {
    throw new HttpError(503, "Checkout is being configured. Please try again shortly.", "checkout_unavailable");
  }
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}
__name(requireRazorpay, "requireRazorpay");
async function requireEbookStorage(env) {
  const readyCount = await env.EBOOKS.get("__catalog_ready__");
  if (readyCount !== String(PSYCHOLOGY_BOOK_COUNT)) {
    throw new HttpError(503, "Downloads are being configured. Please try again shortly.", "downloads_unavailable");
  }
}
__name(requireEbookStorage, "requireEbookStorage");
async function requireIdeaGuideStorage(env) {
  const present = await env.EBOOKS.get(IDEA_GUIDE.objectKey);
  if (!present) {
    throw new HttpError(503, "Downloads are being configured. Please try again shortly.", "downloads_unavailable");
  }
}
__name(requireIdeaGuideStorage, "requireIdeaGuideStorage");
async function requireAiProStorage(env) {
  const present = await env.EBOOKS.get(AI_PRO_GUIDE.objectKey);
  if (!present) {
    throw new HttpError(503, "Downloads are being configured. Please try again shortly.", "downloads_unavailable");
  }
}
__name(requireAiProStorage, "requireAiProStorage");
async function requireProductStorage(env, productId) {
  if (productId === IDEA_GUIDE.id) return requireIdeaGuideStorage(env);
  if (productId === AI_PRO_GUIDE.id) return requireAiProStorage(env);
  if (productId === "bundle-ideas-ai-pro") {
    await requireIdeaGuideStorage(env);
    await requireAiProStorage(env);
    return;
  }
  return requireEbookStorage(env);
}
__name(requireProductStorage, "requireProductStorage");
async function readJson(request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 16384) throw new HttpError(413, "Request is too large.");
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "Expected a JSON request.");
  }
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}
__name(readJson, "readJson");
function cleanEmail(value) {
  if (typeof value !== "string") throw new HttpError(400, "Enter a valid email address.", "invalid_email");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Enter a valid email address.", "invalid_email");
  }
  return email;
}
__name(cleanEmail, "cleanEmail");
function cleanName(value) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, "Name must be text.");
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > 80) throw new HttpError(400, "Name must be 80 characters or fewer.");
  return name;
}
__name(cleanName, "cleanName");
async function razorpayRequest(env, path, init = {}) {
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
  return await response.json();
}
__name(razorpayRequest, "razorpayRequest");
async function createOrder(request, env) {
  const body = await readJson(request);
  if (typeof body.productId !== "string") throw new HttpError(400, "Choose a valid product.", "invalid_product");
  await requireProductStorage(env, body.productId);
  if (!configured(env.RAZORPAY_WEBHOOK_SECRET)) {
    throw new HttpError(503, "Payment verification is being configured. Please try again shortly.", "checkout_unavailable");
  }
  if (typeof body.productId !== "string") throw new HttpError(400, "Choose a valid product.", "invalid_product");
  const product = findProduct(body.productId, env);
  if (!product) throw new HttpError(400, "Choose a valid product.", "invalid_product");
  const email = cleanEmail(body.email);
  const name = cleanName(body.name);
  const recoverySecret = randomToken();
  const recoveryHash = await sha256Hex(recoverySecret);
  const localId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1e3);
  const razorpayOrder = await razorpayRequest(env, "/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: product.amount,
      currency: product.currency,
      receipt: `ebook_${localId.replace(/-/g, "").slice(0, 26)}`,
      notes: { product_id: product.id, buyer_email: email }
    })
  });
  if (!razorpayOrder.id || razorpayOrder.amount !== product.amount || razorpayOrder.currency !== product.currency) {
    throw new HttpError(502, "Payment order could not be confirmed.", "payment_service_error");
  }
  await env.DB.prepare(
    `INSERT INTO orders
      (id, razorpay_order_id, product_id, amount, currency, buyer_email, buyer_name,
       recovery_hash, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  ).bind(
    localId,
    razorpayOrder.id,
    product.id,
    product.amount,
    product.currency,
    email,
    name,
    recoveryHash,
    now,
    now
  ).run();
  return json({
    keyId: requireRazorpay(env).keyId,
    orderId: razorpayOrder.id,
    productId: product.id,
    productName: product.name,
    amount: product.amount,
    currency: product.currency,
    email,
    name,
    recoverySecret
  });
}
__name(createOrder, "createOrder");
async function getStoredOrder(env, razorpayOrderId) {
  const order = await env.DB.prepare("SELECT * FROM orders WHERE razorpay_order_id = ?").bind(razorpayOrderId).first();
  if (!order) throw new HttpError(404, "Purchase record was not found.", "order_not_found");
  return order;
}
__name(getStoredOrder, "getStoredOrder");
async function issueGrant(env, order) {
  await requireEbookStorage(env);
  if (order.status === "refunded") throw new HttpError(403, "This purchase has been refunded.", "refunded");
  const product = findProduct(order.product_id, env);
  if (!product) throw new HttpError(500, "Product mapping is unavailable.");
  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const grantId = `grant:${order.id}`;
  const now = Math.floor(Date.now() / 1e3);
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
         created_at = excluded.created_at`
    ).bind(grantId, order.id, tokenHash, expiresAt, now),
    env.DB.prepare("DELETE FROM grant_items WHERE grant_id = ?").bind(grantId),
    ...product.bookIds.map(
      (bookId) => env.DB.prepare("INSERT INTO grant_items (grant_id, book_id, downloads) VALUES (?, ?, 0)").bind(
        grantId,
        bookId
      )
    )
  ];
  await env.DB.batch(statements);
  const downloads = product.bookIds.map((bookId) => {
    const book = findBook(bookId);
    if (!book) throw new HttpError(500, "Book mapping is unavailable.");
    return {
      id: book.id,
      title: book.title,
      language: book.language,
      url: `/download/${token}/${book.id}`
    };
  });
  return { token, expiresAt, downloads };
}
__name(issueGrant, "issueGrant");
async function verifyPayment(request, env) {
  const body = await readJson(request);
  if (typeof body.razorpay_order_id !== "string" || typeof body.razorpay_payment_id !== "string" || typeof body.razorpay_signature !== "string") {
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
    `${order.razorpay_order_id}|${body.razorpay_payment_id}`
  );
  if (!timingSafeEqual(expectedSignature, body.razorpay_signature)) {
    throw new HttpError(400, "Payment signature could not be verified.", "invalid_signature");
  }
  const payment = await razorpayRequest(env, `/payments/${body.razorpay_payment_id}`);
  if (payment.id !== body.razorpay_payment_id || payment.order_id !== order.razorpay_order_id || payment.amount !== order.amount || payment.currency !== order.currency) {
    throw new HttpError(400, "Payment details do not match this order.", "payment_mismatch");
  }
  if (payment.status !== "captured" || !payment.captured) {
    throw new HttpError(409, "Payment is still processing. Use \u2018Restore purchase\u2019 in a moment.", "payment_processing");
  }
  const now = Math.floor(Date.now() / 1e3);
  const update = await env.DB.prepare(
    `UPDATE orders SET status = 'paid', payment_id = ?, paid_at = COALESCE(paid_at, ?), updated_at = ?
     WHERE id = ? AND status != 'refunded' AND (payment_id IS NULL OR payment_id = ?)`
  ).bind(payment.id, now, now, order.id, payment.id).run();
  if (update.meta.changes !== 1) throw new HttpError(409, "This payment is linked to another purchase.");
  const paidOrder = { ...order, status: "paid", payment_id: payment.id, paid_at: now };
  return json({ success: true, ...await issueGrant(env, paidOrder) });
}
__name(verifyPayment, "verifyPayment");
async function restoreAccess(request, env) {
  const body = await readJson(request);
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
  return json({ success: true, ...await issueGrant(env, order) });
}
__name(restoreAccess, "restoreAccess");
function paymentFromWebhook(payload) {
  const inner = payload.payload;
  const container = inner && typeof inner === "object" ? inner.payment : payload.payment;
  if (!container || typeof container !== "object") return null;
  const entity = container.entity;
  return entity && typeof entity === "object" ? entity : null;
}
__name(paymentFromWebhook, "paymentFromWebhook");
async function handleWebhook(request, env) {
  if (!configured(env.RAZORPAY_WEBHOOK_SECRET)) {
    throw new HttpError(503, "Webhook secret is not configured.");
  }
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = await hmacHex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  if (!timingSafeEqual(expected, signature)) throw new HttpError(400, "Invalid webhook signature.");
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new HttpError(400, "Invalid webhook payload.");
  }
  const eventType = typeof payload.event === "string" ? payload.event : "unknown";
  const eventId = request.headers.get("x-razorpay-event-id") ?? await sha256Hex(rawBody);
  const now = Math.floor(Date.now() / 1e3);
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO webhook_events (event_id, event_type, processed_at) VALUES (?, ?, ?)"
  ).bind(eventId, eventType, now).run();
  if (inserted.meta.changes === 0) return json({ received: true, duplicate: true });
  try {
    const payment = paymentFromWebhook(payload);
    console.log("webhook: event=%s payment.order_id=%s", eventType, payment?.order_id ?? "NONE");
    if (eventType === "payment.captured" && payment?.order_id) {
      const order = await env.DB.prepare("SELECT * FROM orders WHERE razorpay_order_id = ?").bind(payment.order_id).first();
      console.log("webhook: order lookup for %s => %s", payment.order_id, order ? `found id=${order.id} amount=${order.amount} status=${order.status}` : "NOT FOUND");
      if (order) {
        if (payment.amount !== order.amount || payment.currency !== order.currency) {
          throw new Error("Captured webhook amount or currency mismatch");
        }
        await env.DB.prepare(
          `UPDATE orders SET status = 'paid', payment_id = ?, paid_at = COALESCE(paid_at, ?), updated_at = ?
           WHERE id = ? AND status != 'refunded'`
        ).bind(payment.id, now, now, order.id).run();
      }
    } else if (eventType === "payment.failed" && payment?.order_id) {
      await env.DB.prepare(
        "UPDATE orders SET status = 'failed', updated_at = ? WHERE razorpay_order_id = ? AND status = 'pending'"
      ).bind(now, payment.order_id).run();
    } else if ((eventType === "payment.refunded" || eventType === "refund.processed") && payment?.id) {
      const order = await env.DB.prepare("SELECT id FROM orders WHERE payment_id = ?").bind(payment.id).first();
      if (order) {
        await env.DB.batch([
          env.DB.prepare("UPDATE orders SET status = 'refunded', updated_at = ? WHERE id = ?").bind(now, order.id),
          env.DB.prepare("UPDATE download_grants SET revoked = 1 WHERE order_id = ?").bind(order.id)
        ]);
      }
    }
  } catch (error) {
    await env.DB.prepare("DELETE FROM webhook_events WHERE event_id = ?").bind(eventId).run();
    throw error;
  }
  return json({ received: true });
}
__name(handleWebhook, "handleWebhook");
async function downloadBook(pathname, env) {
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
     WHERE g.token_hash = ? AND gi.book_id = ?`
  ).bind(tokenHash, bookId).first();
  const now = Math.floor(Date.now() / 1e3);
  if (!grant || grant.revoked || grant.status !== "paid" || grant.expires_at < now) {
    throw new HttpError(403, "This download link is invalid or has expired.", "download_denied");
  }
  const limit = positiveInteger(env.DOWNLOAD_LIMIT, 3, 20);
  if (grant.downloads >= limit) {
    throw new HttpError(429, "This file has reached its download limit.", "download_limit");
  }
  const object = await env.EBOOKS.get(book.objectKey, "arrayBuffer");
  if (!object) {
    console.error("Missing protected ebook object", book.objectKey);
    throw new HttpError(503, "This file is temporarily unavailable.", "file_unavailable");
  }
  const counted = await env.DB.prepare(
    "UPDATE grant_items SET downloads = downloads + 1 WHERE grant_id = ? AND book_id = ? AND downloads < ?"
  ).bind(grant.id, bookId, limit).run();
  if (counted.meta.changes !== 1) throw new HttpError(429, "This file has reached its download limit.");
  const headers = new Headers();
  headers.set("content-type", "application/pdf");
  headers.set("content-disposition", `attachment; filename="${book.fileName}"`);
  headers.set("content-length", String(object.byteLength));
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object, { headers });
}
__name(downloadBook, "downloadBook");
function publicProduct(product) {
  return {
    ...product,
    displayPrice: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency,
      maximumFractionDigits: 0
    }).format(product.amount / 100)
  };
}
__name(publicProduct, "publicProduct");
async function route(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;
  if (request.method === "GET" && pathname === "/api/catalog") {
    return json({
      storeName: env.STORE_NAME ?? "Seedhi Baat Guides",
      supportEmail: env.SUPPORT_EMAIL?.endsWith(".invalid") ? null : env.SUPPORT_EMAIL,
      books: BOOKS,
      products: productsFor(env).map(publicProduct)
    });
  }
  if (request.method === "GET" && pathname === "/api/health") {
    const catalogReady = await env.EBOOKS.get("__catalog_ready__") === String(PSYCHOLOGY_BOOK_COUNT);
    const ideasReady = Boolean(await env.EBOOKS.get(IDEA_GUIDE.objectKey));
    const aiProReady = Boolean(await env.EBOOKS.get(AI_PRO_GUIDE.objectKey));
    const downloadsConfigured = catalogReady && ideasReady && aiProReady;
    return json({
      ok: true,
      checkoutConfigured: configured(env.RAZORPAY_KEY_ID) && configured(env.RAZORPAY_KEY_SECRET) && configured(env.RAZORPAY_WEBHOOK_SECRET),
      webhookConfigured: configured(env.RAZORPAY_WEBHOOK_SECRET),
      downloadsConfigured,
      catalogReady,
      ideasReady,
      aiProReady
    });
  }
  if (request.method === "POST" && pathname === "/api/orders") return createOrder(request, env);
  if (request.method === "POST" && pathname === "/api/payments/verify") return verifyPayment(request, env);
  if (request.method === "POST" && pathname === "/api/access") return restoreAccess(request, env);
  if (request.method === "POST" && (pathname === "/api/webhooks/razorpay" || pathname === "/api/webhooks/rzrpay"))
    return handleWebhook(request, env);
  if (request.method === "GET" && pathname.startsWith("/download/")) return downloadBook(pathname, env);
  if (pathname.startsWith("/api/") || pathname.startsWith("/download/")) {
    throw new HttpError(404, "Not found.", "not_found");
  }
  return env.ASSETS.fetch(request);
}
__name(route, "route");
var index_default = {
  async fetch(request, env) {
    try {
      return withSecurityHeaders(await route(request, env));
    } catch (error) {
      if (error instanceof HttpError) {
        return withSecurityHeaders(json({ error: error.message, code: error.code }, error.status));
      }
      console.error("Unhandled storefront error", error);
      return withSecurityHeaders(json({ error: "Something went wrong. Please try again.", code: "server_error" }, 500));
    }
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
