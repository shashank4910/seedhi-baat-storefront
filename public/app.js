const state = {
  catalog: null,
  language: "Hinglish",
  selectedProduct: null,
  upgradeProduct: null,
  checkoutConfigured: false,
};
const pendingKey = "seedhi_baat_pending_order";

const elements = {
  bundleGrid: document.querySelector("#bundleGrid"),
  bookGrid: document.querySelector("#bookGrid"),
  checkoutDialog: document.querySelector("#checkoutDialog"),
  checkoutForm: document.querySelector("#checkoutForm"),
  checkoutProduct: document.querySelector("#checkoutProduct"),
  checkoutPrice: document.querySelector("#checkoutPrice"),
  checkoutStatus: document.querySelector("#checkoutStatus"),
  payButton: document.querySelector("#payButton"),
  upgradeOffer: document.querySelector("#upgradeOffer"),
  upgradeText: document.querySelector("#upgradeText"),
  upgradeButton: document.querySelector("#upgradeButton"),
  successDialog: document.querySelector("#successDialog"),
  downloadList: document.querySelector("#downloadList"),
  expiryDate: document.querySelector("#expiryDate"),
  restoreDialog: document.querySelector("#restoreDialog"),
  restoreStatus: document.querySelector("#restoreStatus"),
};

function productById(id) {
  return state.catalog?.products.find((product) => product.id === id);
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderBundles() {
  const bundles = state.catalog.products.filter((product) => product.kind === "bundle");
  const singleAmount = state.catalog.products.find((product) => product.kind === "single").amount;
  elements.bundleGrid.innerHTML = bundles
    .map((product) => {
      const featured = product.id === "bundle-complete";
      const individualPrice = formatPrice(singleAmount * product.bookIds.length);
      return `<article class="bundle-card${featured ? " featured" : ""}">
        <span class="badge">${escapeHtml(product.badge || "Complete set")}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="bundle-meta">
          <div class="bundle-price"><strong>${escapeHtml(product.displayPrice)}</strong><span><s>${escapeHtml(individualPrice)}</s> individually · ${product.bookIds.length} PDFs</span></div>
          <button class="button button-plain" type="button" data-buy="${escapeHtml(product.id)}">Choose set</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderBooks() {
  const books = state.catalog.books.filter((book) => book.language === state.language);
  elements.bookGrid.innerHTML = books
    .map((book, index) => {
      const product = productById(book.id);
      return `<article class="book-card">
        <div class="book-cover accent-${escapeHtml(book.id.split("-")[0])}">
          <small>SEEDHI BAAT · GUIDE ${String(index + 1).padStart(2, "0")}</small>
          <strong>${escapeHtml(book.title)}</strong>
          <span>100 real-life situations</span>
        </div>
        <div class="book-info">
          <p class="book-topic">${escapeHtml(book.topic)} · ${book.pages} pages</p>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="book-description">${escapeHtml(book.description)}</p>
          <div class="book-buy">
            <strong>${escapeHtml(product.displayPrice)}</strong>
            <button class="small-buy" type="button" data-buy="${escapeHtml(product.id)}">Buy PDF →</button>
          </div>
        </div>
      </article>`;
    })
    .join("");
}

function openCheckout(productId) {
  const product = productById(productId);
  if (!product) return;
  state.selectedProduct = product;
  state.upgradeProduct =
    product.kind === "single"
      ? state.catalog.products.find(
          (candidate) => candidate.id === `bundle-${product.language.toLowerCase()}`,
        )
      : product.id !== "bundle-complete"
        ? productById("bundle-complete")
        : null;

  elements.checkoutProduct.textContent = product.name;
  elements.checkoutPrice.textContent = product.displayPrice;
  if (state.upgradeProduct) {
    const extra = formatPrice(state.upgradeProduct.amount - product.amount);
    elements.upgradeText.textContent =
      product.kind === "single"
        ? `Get all 5 ${product.language} guides for only ${extra} more.`
        : `Get both languages—all 10 guides—for only ${extra} more.`;
    elements.upgradeButton.textContent = `Upgrade to ${state.upgradeProduct.displayPrice}`;
    elements.upgradeOffer.hidden = false;
  } else {
    elements.upgradeOffer.hidden = true;
  }

  elements.payButton.disabled = !state.checkoutConfigured;
  elements.checkoutStatus.textContent = state.checkoutConfigured
    ? ""
    : "Secure checkout is being activated. You can review the collection now and return shortly.";
  elements.checkoutDialog.showModal();
}

function setBusy(button, busy, busyLabel, readyLabel) {
  button.disabled = busy;
  button.textContent = busy ? busyLabel : readyLabel;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({ error: "Unexpected server response." }));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed.");
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function verifyCheckout(result) {
  elements.checkoutStatus.textContent = "Payment received. Verifying it securely…";
  try {
    const access = await api("/api/payments/verify", {
      method: "POST",
      body: JSON.stringify(result),
    });
    elements.checkoutDialog.close();
    showDownloads(access);
  } catch (error) {
    elements.checkoutStatus.textContent = error.message;
  } finally {
    setBusy(elements.payButton, false, "Opening Razorpay…", "Continue to Razorpay");
  }
}

async function startCheckout(event) {
  event.preventDefault();
  if (!state.selectedProduct) return;
  if (!state.checkoutConfigured) {
    elements.checkoutStatus.textContent = "Secure checkout is being activated. Please return shortly.";
    return;
  }
  if (!window.Razorpay) {
    elements.checkoutStatus.textContent = "Razorpay could not load. Check your connection and try again.";
    return;
  }

  setBusy(elements.payButton, true, "Creating secure order…", "Continue to Razorpay");
  elements.checkoutStatus.textContent = "";
  try {
    const order = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        productId: state.selectedProduct.id,
        name: document.querySelector("#buyerName").value,
        email: document.querySelector("#buyerEmail").value,
      }),
    });
    localStorage.setItem(
      pendingKey,
      JSON.stringify({ orderId: order.orderId, recoverySecret: order.recoverySecret, createdAt: Date.now() }),
    );

    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: state.catalog.storeName,
      description: order.productName,
      prefill: { name: order.name || "", email: order.email },
      theme: { color: "#191c1a" },
      modal: {
        ondismiss: () => {
          elements.checkoutStatus.textContent = "Checkout closed. You have not been charged unless Razorpay confirmed payment.";
          setBusy(elements.payButton, false, "Opening Razorpay…", "Continue to Razorpay");
        },
      },
      handler: verifyCheckout,
    });
    elements.checkoutStatus.textContent = "Complete payment in the Razorpay window.";
    checkout.open();
  } catch (error) {
    elements.checkoutStatus.textContent = error.message;
    setBusy(elements.payButton, false, "Opening Razorpay…", "Continue to Razorpay");
  }
}

function showDownloads(access) {
  elements.expiryDate.textContent = new Date(access.expiresAt * 1000).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  elements.downloadList.innerHTML = access.downloads
    .map(
      (download) => `<a class="download-link" href="${escapeHtml(download.url)}">
        ${escapeHtml(download.title)} <span>${escapeHtml(download.language)} · Download PDF ↓</span>
      </a>`,
    )
    .join("");
  elements.successDialog.showModal();
}

async function restorePurchase() {
  elements.restoreStatus.textContent = "";
  const pending = JSON.parse(localStorage.getItem(pendingKey) || "null");
  if (!pending?.orderId || !pending?.recoverySecret) {
    elements.restoreStatus.textContent = "No purchase recovery code was found in this browser.";
    return;
  }
  const button = document.querySelector("#runRestore");
  setBusy(button, true, "Checking payment…", "Restore download links");
  try {
    const access = await api("/api/access", {
      method: "POST",
      body: JSON.stringify({ orderId: pending.orderId, recoverySecret: pending.recoverySecret }),
    });
    elements.restoreDialog.close();
    showDownloads(access);
  } catch (error) {
    elements.restoreStatus.textContent = error.message;
  } finally {
    setBusy(button, false, "Checking payment…", "Restore download links");
  }
}

async function loadCatalog() {
  try {
    const [catalog, health] = await Promise.all([
      api("/api/catalog", { headers: {} }),
      api("/api/health", { headers: {} }),
    ]);
    state.catalog = catalog;
    state.checkoutConfigured = health.checkoutConfigured;
    document.title = `${state.catalog.storeName} — Practical ebooks for real life`;
    renderBundles();
    renderBooks();
    if (state.catalog.supportEmail) {
      document.querySelector("#supportLine").innerHTML = `Support: <a href="mailto:${escapeHtml(state.catalog.supportEmail)}">${escapeHtml(state.catalog.supportEmail)}</a>`;
    }
  } catch (error) {
    elements.bundleGrid.innerHTML = `<p class="loading">${escapeHtml(error.message)}</p>`;
    elements.bookGrid.innerHTML = `<p class="loading">${escapeHtml(error.message)}</p>`;
  }
}

document.addEventListener("click", (event) => {
  const buyButton = event.target.closest("[data-buy]");
  if (buyButton) openCheckout(buyButton.dataset.buy);

  const languageButton = event.target.closest("[data-language]");
  if (languageButton) {
    state.language = languageButton.dataset.language;
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === state.language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderBooks();
  }
});

elements.upgradeButton.addEventListener("click", () => {
  if (state.upgradeProduct) openCheckout(state.upgradeProduct.id);
});
document.querySelector("#restoreButton").addEventListener("click", () => {
  elements.restoreStatus.textContent = "";
  elements.restoreDialog.showModal();
});
document.querySelector("#runRestore").addEventListener("click", restorePurchase);
elements.checkoutForm.addEventListener("submit", startCheckout);
document.querySelector("#year").textContent = new Date().getFullYear();
loadCatalog();
