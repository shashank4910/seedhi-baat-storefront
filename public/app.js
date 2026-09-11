// Seedhi Baat Guides - Frontend checkout integration for Razorpay Standard Checkout

(function () {
  'use strict';

  let catalog = null;
  let selectedProduct = null;

  // DOM elements
  const bundleGrid = document.getElementById('bundleGrid');
  const bookGrid = document.getElementById('bookGrid');
  const checkoutDialog = document.getElementById('checkoutDialog');
  const checkoutProduct = document.getElementById('checkoutProduct');
  const checkoutPrice = document.getElementById('checkoutPrice');
  const checkoutForm = document.getElementById('checkoutForm');
  const buyerName = document.getElementById('buyerName');
  const buyerEmail = document.getElementById('buyerEmail');
  const payButton = document.getElementById('payButton');
  const checkoutStatus = document.getElementById('checkoutStatus');
  const successDialog = document.getElementById('successDialog');
  const downloadList = document.getElementById('downloadList');
  const expiryDate = document.getElementById('expiryDate');
  const restoreButton = document.getElementById('restoreButton');
  const restoreDialog = document.getElementById('restoreDialog');
  const runRestore = document.getElementById('runRestore');
  const restoreStatus = document.getElementById('restoreStatus');
  const languageToggle = document.querySelector('.language-toggle');

  // Storage keys
  const RECOVERY_SECRET_KEY = 'sb_recovery_secret';
  const RECOVERY_ORDER_ID_KEY = 'sb_recovery_order_id';

  // Utilities
  async function sha256Hex(str) {
    const data = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function hmacHex(key, data) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(key),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(data));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function randomToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Catalog fetching
  async function fetchCatalog() {
    try {
      const res = await fetch('/api/catalog');
      if (!res.ok) throw new Error('Failed to fetch catalog');
      catalog = await res.json();
      populateUI();
    } catch (err) {
      console.error('Catalog fetch error:', err);
      bundleGrid.innerHTML = '<p class="error">Unable to load the catalog. Please try again later.</p>';
      bookGrid.innerHTML = '<p class="error">Unable to load the catalog. Please try again later.</p>';
    }
  }

  function formatPrice(amount, currency) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount / 100);
  }

  // Escape helper to keep injected catalog text safe.
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Map a book topic/id to the accent class defined in styles.css.
  function accentClass(book) {
    const id = (book.id || '').toLowerCase();
    if (id.includes('manipulation')) return 'accent-manipulation';
    if (id.includes('conversation')) return 'accent-conversation';
    if (id.includes('people')) return 'accent-people';
    if (id.includes('attraction')) return 'accent-attraction';
    if (id.includes('office')) return 'accent-office';
    return 'accent-manipulation';
  }

  // UI population
  function populateUI() {
    if (!catalog || !catalog.products) return;

    const products = catalog.products;
    const language = languageToggle.querySelector('button.active')?.dataset.language || 'Hinglish';

    // Render bundles (language sets + complete library).
    const bundleProducts = products.filter(p => p.kind === 'bundle');
    bundleGrid.innerHTML = '';
    bundleProducts.forEach((product) => {
      const featured = product.id === 'bundle-complete';
      const item = document.createElement('article');
      item.className = 'bundle-card' + (featured ? ' featured' : '');
      item.innerHTML = `
        <span class="badge">${esc(product.badge || product.bookIds.length + ' books')}</span>
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.description || '')}</p>
        <div class="bundle-meta">
          <div class="bundle-price"><strong>${formatPrice(product.amount, product.currency)}</strong><span>One-time · instant PDF</span></div>
          <button type="button" class="button bundle-select">Buy now</button>
        </div>
      `;
      bundleGrid.appendChild(item);
      item.querySelector('.bundle-select').addEventListener('click', () => openCheckout(product));
    });

    // Render single books filtered by the selected language.
    const bookProducts = products.filter(p => p.kind === 'single');
    bookGrid.innerHTML = '';
    bookProducts.forEach(product => {
      const book = catalog.books.find(b => b.id === product.bookIds[0]) || {};
      if (book.language !== language) return;

      const item = document.createElement('article');
      item.className = 'book-card';
      item.innerHTML = `
        <div class="book-cover ${accentClass(book)}">
          <small>${esc(book.topic || 'Guide')}</small>
          <strong>${esc(book.title || product.name)}</strong>
          <span>${esc(book.pages ? book.pages + ' pages' : book.language || '')}</span>
        </div>
        <div class="book-info">
          <p class="book-topic">${esc(book.topic || '')}</p>
          <h3>${esc(book.title || product.name)}</h3>
          <p class="book-description">${esc(book.description || '')}</p>
          <div class="book-buy">
            <strong>${formatPrice(product.amount, product.currency)}</strong>
            <button type="button" class="small-buy book-select">Buy this book →</button>
          </div>
        </div>
      `;
      bookGrid.appendChild(item);
      item.querySelector('.book-select').addEventListener('click', () => openCheckout(product));
    });

    if (!bookGrid.children.length) {
      bookGrid.innerHTML = '<p class="loading">No books in this language yet.</p>';
    }

    // Support line
    if (catalog.supportEmail) {
      document.getElementById('supportLine').textContent = `Support: ${catalog.supportEmail}`;
    }
  }

  // Language toggle
  if (languageToggle) {
    languageToggle.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        languageToggle.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        e.currentTarget.classList.add('active');
        e.currentTarget.setAttribute('aria-pressed', 'true');
        populateUI();
      });
    });
  }

  // Restore purchase
  restoreButton.addEventListener('click', () => {
    restoreDialog.showModal();
    restoreStatus.textContent = '';
  });

  runRestore.addEventListener('click', async () => {
    const recoverySecret = localStorage.getItem(RECOVERY_SECRET_KEY);
    const orderId = localStorage.getItem(RECOVERY_ORDER_ID_KEY);

    if (!recoverySecret || !orderId) {
      restoreStatus.textContent = 'No purchase found on this device. Please make a new purchase.';
      return;
    }

    runRestore.disabled = true;
    restoreStatus.textContent = 'Restoring purchase...';

    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, recoverySecret })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Restore failed');
      }

      const data = await res.json();
      showSuccess(data);
      restoreStatus.textContent = '';
    } catch (err) {
      restoreStatus.textContent = err.message || 'Failed to restore purchase. Please try again.';
    } finally {
      runRestore.disabled = false;
    }
  });

  // Checkout
  function openCheckout(product) {
    selectedProduct = product;
    checkoutProduct.textContent = product.name;
    checkoutPrice.textContent = formatPrice(product.amount, product.currency);
    buyerName.value = '';
    buyerEmail.value = '';
    checkoutStatus.textContent = '';
    checkoutStatus.className = 'form-status';
    payButton.disabled = false;
    payButton.textContent = 'Continue to Razorpay';
    checkoutDialog.showModal();
  }

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = buyerName.value.trim();
    const email = buyerEmail.value.trim().toLowerCase();

    if (!email) {
      checkoutStatus.textContent = 'Please enter your email address.';
      checkoutStatus.className = 'form-status error';
      return;
    }

    payButton.disabled = true;
    payButton.textContent = 'Creating secure order…';
    checkoutStatus.textContent = '';
    checkoutStatus.className = 'form-status';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, name, email })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Order creation failed');
      }

      const order = await res.json();
      initiateRazorpay(order);
    } catch (err) {
      checkoutStatus.textContent = err.message || 'Unable to create order. Please try again.';
      checkoutStatus.className = 'form-status error';
      resetPayButton();
    }
  });

  function resetPayButton() {
    payButton.disabled = false;
    payButton.textContent = 'Continue to Razorpay';
  }

  // Reopen the checkout dialog to show an error after the Razorpay window is gone.
  function reopenCheckoutWithError(message) {
    resetPayButton();
    checkoutStatus.textContent = message;
    checkoutStatus.className = 'form-status error';
    if (!checkoutDialog.open) {
      try {
        checkoutDialog.showModal();
      } catch (_) {
        /* dialog may already be open */
      }
    }
  }

  async function initiateRazorpay(order) {
    let verificationStarted = false;

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.productName,
      description: 'Practical psychology guides',
      order_id: order.orderId,
      handler: async function (response) {
        verificationStarted = true;
        const razorpayPaymentId = response.razorpay_payment_id;
        const razorpayOrderId = response.razorpay_order_id;
        const razorpaySignature = response.razorpay_signature;

        try {
          const res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: razorpayPaymentId,
              razorpay_signature: razorpaySignature
            })
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Payment verification failed');
          }

          const data = await res.json();

          // Save recovery data
          if (order.recoverySecret && order.orderId) {
            localStorage.setItem(RECOVERY_SECRET_KEY, order.recoverySecret);
            localStorage.setItem(RECOVERY_ORDER_ID_KEY, order.orderId);
          }

          resetPayButton();
          checkoutStatus.textContent = '';
          showSuccess(data);
        } catch (err) {
          reopenCheckoutWithError(
            (err && err.message) ||
              'Payment succeeded but verification failed. Use “Restore purchase” or contact support.'
          );
        }
      },
      modal: {
        ondismiss: function () {
          // User closed the Razorpay window without completing payment.
          if (!verificationStarted) {
            reopenCheckoutWithError('Payment was cancelled. You can try again.');
          }
        }
      },
      prefill: {
        name: order.name || '',
        email: order.email || ''
      },
      theme: {
        color: '#5a45d8'
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function () {
      reopenCheckoutWithError('Payment failed. Please try another payment method.');
    });

    // Close our checkout dialog so only the Razorpay window is visible.
    if (checkoutDialog.open) checkoutDialog.close();
    checkoutStatus.textContent = '';
    rzp.open();
  }

  function showSuccess(data) {
    successDialog.showModal();

    if (data.token && data.expiresAt) {
      const expiry = new Date(data.expiresAt * 1000);
      expiryDate.textContent = expiry.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    downloadList.innerHTML = '';
    if (data.downloads && Array.isArray(data.downloads)) {
      data.downloads.forEach((item, idx) => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'button button-plain full-width download-link';
        link.download = '';
        link.textContent = `${idx + 1}. ${item.title} (${item.language})`;
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          const btn = e.currentTarget;
          btn.disabled = true;
          btn.textContent = 'Downloading...';

          try {
            const res = await fetch(item.url);
            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.title + '.pdf';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
            btn.textContent = 'Downloaded ✓';
          } catch (err) {
            btn.textContent = 'Download failed';
            console.error('Download error:', err);
          }
        });
        downloadList.appendChild(link);
      });
    }
  }

  // Initialize
  fetchCatalog();

  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
})();
