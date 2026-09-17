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

  const SHOW_HINDI_BOOKS = false; // Hindi editions exist in catalog but are hidden from the storefront
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

  const aiOffer = new URLSearchParams(location.search).get('offer') === 'ai';
  if (aiOffer) {
    document.body.classList.add('ai-offer');
    document.title = 'AI Skills & Business Starter Pack — Seedhi Baat';
    document.getElementById('top').prepend(document.getElementById('ai'));
    document.querySelector('.skip-link').href = '#ai';
    document.querySelector('.site-header a[href="#library"]').href = '/';
    document.querySelector('.site-header a[href="#sample"]').href = '/#sample';
    document.querySelector('#how .steps li p').textContent = 'Choose one AI guide or both books together.';
    document.querySelector('.mobile-buybar span').innerHTML = '2 practical AI guides<br><strong>₹499 together</strong>';
    const quick = document.querySelector('.mobile-buybar a'); quick.href = '#ai'; quick.textContent = 'See AI pack';
  }
  const aiIds = new Set(['ideas-25-under-2k', 'ai-pro-guide']);
  const benefits = {
    manipulation: 'Recognise guilt, pressure and unfair demands. Practise a clear response.',
    conversation: 'Start a conversation, ask a follow-up and handle awkward pauses.',
    people: 'Notice when someone’s words and actions don’t match, and look for repeated patterns.',
    attraction: 'Start talking to someone you like and notice whether they want to keep talking too.',
    office: 'Use practical lines for meetings, feedback and workload conversations.'
  };
  function displayName(product) {
    return product.id === 'bundle-complete' ? 'All 5 guides in Hindi + Hinglish' : product.name;
  }
  function includedBooks(product) {
    return product.bookIds.map(id => catalog.books.find(b => b.id === id)).filter(Boolean);
  }
  function titleList(product) {
    return '<ul class="included-titles">' + includedBooks(product).map(b => '<li>' + esc(b.title) + (product.language === 'Both' ? ' <small>(' + esc(b.language) + ')</small>' : '') + '</li>').join('') + '</ul>';
  }
  function populateUI() {
    if (!catalog || !catalog.products) return;
    const products = catalog.products;
    bundleGrid.innerHTML = '';
    bookGrid.innerHTML = '';
    const aiBundles = document.getElementById('aiBundleGrid');
    const aiBooks = document.getElementById('aiBookGrid');
    aiBundles.innerHTML = ''; aiBooks.innerHTML = '';
    products.filter(p => p.kind === 'bundle').forEach(product => {
      const isAI = product.bookIds.some(id => aiIds.has(id));
      const isComplete = product.id === 'bundle-complete';
      const separate = product.bookIds.reduce((sum, id) => {
        const single = products.find(p => p.kind === 'single' && p.bookIds.length === 1 && p.bookIds[0] === id);
        return sum + (single ? single.amount : 0);
      }, 0);
      const saving = separate - product.amount;
      const count = product.bookIds.length;
      const item = document.createElement('article');
      item.className = 'bundle-card' + (isComplete ? ' featured' : '');
      item.innerHTML = `<p class="badge">${product.language === 'Both' ? '5 subjects · 2 languages · 10 PDFs' : esc(product.language) + ' · ' + count + ' PDFs'}</p>
        <h3>${esc(displayName(product))}</h3>
        <p>${product.language === 'Both' ? 'The same five guides in both languages. Choose the version you prefer for each read.' : esc(product.description)}</p>
        ${titleList(product)}
        <div class="bundle-meta"><div class="bundle-price"><strong>${formatPrice(product.amount, product.currency)}</strong>${saving > 0 ? '<span>Separately ' + formatPrice(separate, product.currency) + ' · Save ' + formatPrice(saving, product.currency) + '</span>' : ''}<span>One-time payment · digital PDFs</span></div>
        <button type="button" class="button bundle-select">Get ${count} PDFs — ${formatPrice(product.amount, product.currency)}</button></div>`;
      (isAI ? aiBundles : bundleGrid).appendChild(item);
      item.querySelector('button').addEventListener('click', () => openCheckout(product));
    });
    products.filter(p => p.kind === 'single').forEach(product => {
      const book = includedBooks(product)[0];
      if (!book || book.language === 'Hindi') return;
      const isAI = aiIds.has(product.id);
      const topic = product.id.split('-')[0];
      const item = document.createElement('article');
      item.className = 'book-card';
      item.id = 'book-' + product.id;
      const cover = isAI ? '' : `<div class="topic-number" aria-hidden="true">0${Object.keys(benefits).indexOf(topic) + 1}</div>`;
      item.innerHTML = `${cover}<div class="book-info"><p class="book-topic">${esc(book.topic)} · PDF</p><h3>${esc(book.title)}</h3><p class="book-description">${esc(benefits[topic] || book.description)}</p><p class="book-language">${esc(book.language)}${isAI ? '' : ' · 100 everyday situations'}</p><div class="book-buy"><strong>${formatPrice(product.amount, product.currency)}</strong><button class="small-buy book-select" type="button">Get this guide</button></div>${!isAI ? '<button class="language-alternative" type="button">Buy this title in Hindi instead</button>' : ''}</div>`;
      (isAI ? aiBooks : bookGrid).appendChild(item);
      item.querySelector('.book-select').addEventListener('click', () => openCheckout(product));
      const hindiButton = item.querySelector('.language-alternative');
      if (hindiButton) hindiButton.addEventListener('click', () => {
        const hindi = products.find(p => p.id === topic + '-hindi');
        if (hindi) openCheckout(hindi);
      });
    });
    if (catalog.supportEmail) document.getElementById('supportLine').textContent = 'Support: ' + catalog.supportEmail;
    document.querySelectorAll('[data-buy]').forEach(button => button.addEventListener('click', () => {
      const product = products.find(p => p.id === button.dataset.buy);
      if (product) openCheckout(product);
    }));
    if (location.hash === '#ai') document.getElementById('ai').scrollIntoView();
  }

  // Language toggle removed — Hinglish books are shown directly.

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
    window.trackMetaEvent?.('ViewContent', {
      content_ids: [product.id],
      contents: [{ id: product.id, quantity: 1 }],
      content_name: displayName(product),
      content_type: 'product',
      num_items: 1,
      value: product.amount / 100,
      currency: product.currency
    });
    checkoutProduct.textContent = displayName(product);
    document.getElementById('checkoutContents').innerHTML = '<p><strong>' + esc(product.language === 'Both' ? 'Hindi + Hinglish' : product.language) + '</strong> · ' + product.bookIds.length + ' PDF' + (product.bookIds.length > 1 ? 's' : '') + ' · one-time purchase</p>' + '<details><summary>View the included PDFs</summary>' + titleList(product) + '</details><p>Download links appear after successful payment.</p>';
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
      const orderIds = order.productIds || [order.productId];
      window.trackMetaEvent?.(
        'InitiateCheckout',
        {
          content_ids: orderIds,
          contents: orderIds.map(id => ({ id, quantity: 1 })),
          content_name: order.productName,
          content_type: 'product',
          num_items: order.itemCount || orderIds.length,
          value: order.amount / 100,
          currency: order.currency
        },
        order.orderId
      );
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

  // Lazy-load Razorpay checkout.js only when a payment is about to happen.
  // This keeps the landing page light: no 188KB third-party script on every ad click.
  let rzpScriptPromise = null;
  function loadRazorpayScript() {
    if (window.Razorpay) return Promise.resolve();
    if (rzpScriptPromise) return rzpScriptPromise;
    rzpScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = () => { rzpScriptPromise = null; reject(new Error('Could not load the payment window. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return rzpScriptPromise;
  }

  async function initiateRazorpay(order) {
    let verificationStarted = false;
    try {
      await loadRazorpayScript();
    } catch (err) {
      reopenCheckoutWithError(err.message);
      return;
    }

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

          const purchasedIds = order.productIds || [order.productId];
          window.trackMetaEvent?.(
            'Purchase',
            {
              content_ids: purchasedIds,
              contents: purchasedIds.map(id => ({ id, quantity: 1 })),
              content_name: order.productName,
              content_type: 'product',
              num_items: order.itemCount || purchasedIds.length,
              value: order.amount / 100,
              currency: order.currency
            },
            razorpayPaymentId
          );

          // Save recovery data
          if (order.recoverySecret && order.orderId) {
            localStorage.setItem(RECOVERY_SECRET_KEY, order.recoverySecret);
            localStorage.setItem(RECOVERY_ORDER_ID_KEY, order.orderId);
          }

          resetPayButton();
          checkoutStatus.textContent = '';
          showSuccess(data);
          // Auto-download the purchased files right after verification succeeds,
          // so the user gets the PDF even if they close the dialog immediately.
          // Runs inside the payment handler's user-activation window, which keeps
          // browsers from blocking it. Manual buttons remain as fallback.
          autoDownload(data.downloads || []);
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

  // ---------- download helpers ----------
  // Fetches the file and saves it via a temporary object URL.
  async function downloadOne(item) {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (item.title || 'seedhi-baat-guide') + '.pdf';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Auto-starts downloads right after a VERIFIED payment so the user gets the
  // files even if they close the success dialog immediately. Best effort: if
  // the browser blocks the programmatic download (user activation expired),
  // the manual buttons in the dialog remain as fallback.
  function autoDownload(downloads) {
    (downloads || []).forEach((item) => {
      downloadOne(item).catch(() => {});
    });
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
            await downloadOne(item);
            btn.textContent = 'Downloaded ✓';
          } catch (err) {
            btn.textContent = 'Download failed — tap to retry';
            console.error('Download error:', err);
          }
        });
        downloadList.appendChild(link);
      });
    }
  }

  // Launch-price deadline (real end date; strip auto-hides after it passes)
  (function () {
    var deadline = new Date('2026-09-30T23:59:59+05:30');
    var el = document.getElementById('dealCountdown');
    if (!el) return;
    function tick() {
      var ms = deadline - Date.now();
      if (ms <= 0) {
        var strip = document.getElementById('launchDeal');
        if (strip) strip.hidden = true;
        var note = document.getElementById('dealNote');
        if (note) note.hidden = true;
        clearInterval(timer);
        return;
      }
      var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
      el.textContent = d > 0 ? d + 'd ' + h + 'h ' + m + 'm left at this price' : h + 'h ' + m + 'm left at this price';
    }
    tick();
    var timer = setInterval(tick, 30000);
  })();

  // Initialize
  fetchCatalog();

  // Year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
})();
