// 25 Ideas landing page — Razorpay Standard Checkout integration
// Product is created server-side by /api/orders; the browser never sets the amount.

(function () {
  'use strict';

  var PRODUCT_ID = 'ideas-25-under-2k';
  var BUNDLE_ID = 'bundle-ideas-ai-pro';
  var PRO_ID = 'ai-pro-guide';
  var DISPLAY_NAME = '25 Business Ideas with AI — Implementation Guide';
  var RECOVERY_SECRET_KEY = 'sb_ideas_recovery_secret';
  var RECOVERY_ORDER_ID_KEY = 'sb_ideas_recovery_order_id';
  var BUNDLE_OFFERED_KEY = 'sb_bundle_offered';

  var PRODUCT_LABELS = {};
  PRODUCT_LABELS[PRODUCT_ID] = { title: '25 Business Ideas with AI — Implementation Guide', price: 'Rs. 299', pay: 'Pay Rs. 299 · Get Instant Access' };
  PRODUCT_LABELS[PRO_ID] = { title: 'Use AI Like a Pro — Beginner\'s Guide', price: 'Rs. 299', pay: 'Pay Rs. 299 · Get Instant Access' };
  PRODUCT_LABELS[BUNDLE_ID] = { title: 'Both books: 25 Business Ideas + Use AI Like a Pro', price: 'Rs. 499', pay: 'Pay Rs. 499 · Get Both Books' };

  var selectedProductId = PRODUCT_ID;

  var buyButton = document.getElementById('buyButton');
  var stickyBuy = document.getElementById('stickyBuy');
  var offerStatus = document.getElementById('offerStatus');
  var checkoutDialog = document.getElementById('checkoutDialog');
  var checkoutForm = document.getElementById('checkoutForm');
  var buyerName = document.getElementById('buyerName');
  var buyerEmail = document.getElementById('buyerEmail');
  var payButton = document.getElementById('payButton');
  var checkoutStatus = document.getElementById('checkoutStatus');
  var successDialog = document.getElementById('successDialog');
  var downloadList = document.getElementById('downloadList');
  var expiryDate = document.getElementById('expiryDate');

  // ---------- countdown timer (visit-scoped) ----------
  var TIMER_KEY = 'sb_ideas_deadline';
  var WINDOW_MINUTES = 15;
  var timerEls = ['offerTimer', 'offerTimer2', 'offerTimer3']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function getDeadline() {
    var stored = Number(localStorage.getItem(TIMER_KEY));
    var now = Date.now();
    if (!stored || stored < now) {
      stored = now + WINDOW_MINUTES * 60 * 1000;
      try { localStorage.setItem(TIMER_KEY, String(stored)); } catch (_) { /* private mode */ }
    }
    return stored;
  }

  function tickTimer() {
    var remaining = Math.max(0, getDeadline() - Date.now());
    var m = String(Math.floor(remaining / 60000)).padStart(2, '0');
    var s = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    timerEls.forEach(function (el) { el.textContent = m + ':' + s; });
  }
  tickTimer();
  setInterval(tickTimer, 1000);

  // ---------- sticky mobile buy bar ----------
  var stickyBar = document.getElementById('stickyBar');
  var offerSection = document.getElementById('offer');

  function onScroll() {
    if (!stickyBar) return;
    var past = window.scrollY > 700;
    var offerVisible = offerSection && offerSection.getBoundingClientRect().top < window.innerHeight * 0.8;
    var active = past && !offerVisible;
    stickyBar.hidden = !active;
    document.body.classList.toggle('sticky-bar-active', !!active);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function setStatus(el, message, isError) {
    el.textContent = message || '';
    el.className = message && isError ? 'form-status error' : 'form-status';
    if (el === offerStatus) {
      el.className = message && isError ? 'micro center form-status error' : 'micro center';
    }
  }

  function reopenCheckoutWithError(message) {
    payButton.disabled = false;
    var labels = PRODUCT_LABELS[selectedProductId] || PRODUCT_LABELS[PRODUCT_ID];
    payButton.textContent = labels ? labels.pay : 'Pay Rs. 299 · Get Instant Access';
    setStatus(checkoutStatus, message, true);
    if (!checkoutDialog.open) {
      try { checkoutDialog.showModal(); } catch (_) { /* already open */ }
    }
  }

  // ---------- buy flow ----------
  function startBuy(productId) {
    selectedProductId = productId || PRODUCT_ID;
    var isBundle = selectedProductId === BUNDLE_ID;
    var labels = PRODUCT_LABELS[selectedProductId] || PRODUCT_LABELS[PRODUCT_ID];
    window.trackMetaEvent?.('ViewContent', {
      content_ids: [selectedProductId],
      contents: [{ id: selectedProductId, quantity: 1 }],
      content_name: labels.title,
      content_type: 'product',
      num_items: 1
    });
    var sumTitle = document.getElementById('orderSummaryTitle');
    var sumPrice = document.getElementById('orderSummaryPrice');
    var sumWas = document.getElementById('orderSummaryWas');
    if (sumTitle && sumPrice && sumWas) {
      sumTitle.innerHTML = isBundle
        ? 'Both books: 25 Business Ideas + Use AI Like a Pro<br /><small>Starter pack · save Rs. 99</small>'
        : escapeHtml(labels.title) + '<br /><small>Launch offer · today only</small>';
      sumPrice.textContent = labels.price;
      sumWas.hidden = !isBundle;
      payButton.textContent = labels.pay;
    }
    // Returning buyer on this device: restore instead of paying twice.
    var savedSecret = localStorage.getItem(RECOVERY_SECRET_KEY);
    var savedOrderId = localStorage.getItem(RECOVERY_ORDER_ID_KEY);
    if (savedSecret && savedOrderId) {
      restore(savedSecret, savedOrderId);
      return;
    }
    buyerEmail.value = '';
    buyerName.value = '';
    setStatus(checkoutStatus, '', false);
    checkoutDialog.showModal();
    buyerEmail.focus();
  }

  buyButton.addEventListener('click', function () { startBuyWithUpsell(PRODUCT_ID); });
  var bundleButton = document.getElementById('bundleButton');
  if (bundleButton) bundleButton.addEventListener('click', function () { startBuy(BUNDLE_ID); });
  var proBuyButton = document.getElementById('proBuyButton');
  if (proBuyButton) proBuyButton.addEventListener('click', function () { startBuy(PRO_ID); });
  if (stickyBuy) stickyBuy.addEventListener('click', function () { startBuyWithUpsell(PRODUCT_ID); });

  // Interstitial: on Buy click, offer the bundle first, then continue to checkout.
  var upsellDialog = document.getElementById('upsellDialog');
  var upsellTakeBundle = document.getElementById('upsellTakeBundle');
  var upsellDecline = document.getElementById('upsellDecline');

  function startBuyWithUpsell(productId) {
    // Returning buyers skip the offer.
    if (localStorage.getItem(RECOVERY_SECRET_KEY) && localStorage.getItem(RECOVERY_ORDER_ID_KEY)) {
      startBuy(productId);
      return;
    }
    if (!upsellDialog) { startBuy(productId); return; }
    upsellTakeBundle.onclick = function () {
      upsellDialog.close();
      startBuy(BUNDLE_ID);
    };
    upsellDecline.onclick = function () {
      upsellDialog.close();
      startBuy(productId);
    };
    upsellDialog.showModal();
  }

  checkoutForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = buyerEmail.value.trim().toLowerCase();
    var name = buyerName.value.trim();
    if (!email) {
      setStatus(checkoutStatus, 'Please enter your email address.', true);
      return;
    }
    payButton.disabled = true;
    payButton.textContent = 'Creating secure order…';
    setStatus(checkoutStatus, '', false);

    try {
      var res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProductId, name: name, email: email })
      });
      if (!res.ok) {
        var err = await res.json().catch(function () { return {}; });
        throw new Error(err.error || 'Order creation failed');
      }
      localStorage.setItem('sb_last_buyer_email', email);
      var order = await res.json();
      var orderIds = order.productIds || [order.productId];
      window.trackMetaEvent?.(
        'InitiateCheckout',
        {
          content_ids: orderIds,
          contents: orderIds.map(function (id) { return { id: id, quantity: 1 }; }),
          content_name: order.productName,
          content_type: 'product',
          num_items: order.itemCount || orderIds.length,
          value: order.amount / 100,
          currency: order.currency
        },
        order.orderId
      );
      openRazorpay(order);
    } catch (err) {
      setStatus(checkoutStatus, (err && err.message) || 'Unable to create order. Please try again.', true);
      payButton.disabled = false;
      payButton.textContent = 'Pay Rs. 299 · Get Instant Access';
    }
  });

  // ---------- razorpay (script lazy-loaded on first payment) ----------
  var rzpScriptPromise = null;
  function loadRazorpayScript() {
    if (window.Razorpay) return Promise.resolve();
    if (rzpScriptPromise) return rzpScriptPromise;
    rzpScriptPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = function () { rzpScriptPromise = null; reject(new Error('Could not load the payment window. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
    return rzpScriptPromise;
  }

  var verificationStarted = false;

  function openRazorpay(order) {
    verificationStarted = false;
    loadRazorpayScript().catch(function () {}); // warm up while user reviews the dialog
    var options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: DISPLAY_NAME,
      description: 'Instant PDF download',
      order_id: order.orderId,
      handler: async function (response) {
        verificationStarted = true;
        try {
          var res = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });
          if (!res.ok) {
            var err = await res.json().catch(function () { return {}; });
            throw new Error(err.error || 'Payment verification failed');
          }
          var data = await res.json();
          var purchasedIds = order.productIds || [order.productId];
          window.trackMetaEvent?.(
            'Purchase',
            {
              content_ids: purchasedIds,
              contents: purchasedIds.map(function (id) { return { id: id, quantity: 1 }; }),
              content_name: order.productName,
              content_type: 'product',
              num_items: order.itemCount || purchasedIds.length,
              value: order.amount / 100,
              currency: order.currency
            },
            response.razorpay_payment_id
          );
          localStorage.setItem(RECOVERY_SECRET_KEY, order.recoverySecret);
          localStorage.setItem(RECOVERY_ORDER_ID_KEY, order.orderId);
          payButton.disabled = false;
          payButton.textContent = 'Pay Rs. 299 · Get Instant Access';
          checkoutStatus.textContent = '';
          showSuccess(data);
        } catch (err) {
          reopenCheckoutWithError(
            (err && err.message) ||
            'Payment succeeded but verification failed. Please contact support with your payment ID.'
          );
        }
      },
      modal: {
        ondismiss: function () {
          if (!verificationStarted) {
            reopenCheckoutWithError('Payment was cancelled. You can try again.');
          }
        }
      },
      prefill: {
        name: order.name || '',
        email: order.email || ''
      },
      theme: { color: '#1e6b4f' }
    };

    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function () {
      reopenCheckoutWithError('Payment failed. Please try another payment method.');
    });
    if (checkoutDialog.open) checkoutDialog.close();
    checkoutStatus.textContent = '';
    loadRazorpayScript().then(function () {
      rzp.open();
    }).catch(function (err) {
      reopenCheckoutWithError(err.message);
    });
  }

  // ---------- restore ----------
  async function restore(secret, orderId) {
    payButton.disabled = true;
    payButton.textContent = 'Checking previous purchase…';
    setStatus(offerStatus, 'Checking your previous purchase…', false);
    try {
      var res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId, recoverySecret: secret })
      });
      if (!res.ok) {
        var err = await res.json().catch(function () { return {}; });
        throw new Error(err.error || 'Restore failed');
      }
      setStatus(offerStatus, '', false);
      showSuccess(await res.json());
    } catch (err) {
      // Stale recovery data (e.g. refunded or different device) — fall back to checkout.
      localStorage.removeItem(RECOVERY_SECRET_KEY);
      localStorage.removeItem(RECOVERY_ORDER_ID_KEY);
      setStatus(offerStatus, '', false);
      buyerEmail.value = '';
      buyerName.value = '';
      setStatus(checkoutStatus, '', false);
      checkoutDialog.showModal();
      buyerEmail.focus();
    } finally {
      payButton.disabled = false;
      payButton.textContent = 'Pay Rs. 299 · Get Instant Access';
    }
  }

  // ---------- post-purchase upsell (bundle: add the AI skills guide) ----------
  var UPSELL = {
    title: 'Add Use AI Like a Pro — complete your kit',
    blurb: 'The ideas tell you what to sell; this 59-page guide teaches you the AI skills to deliver them. Get both right now for Rs. 200 more instead of Rs. 299 later.',
    price: 'Add Rs. 200 (bundle Rs. 499)',
    priceNote: 'Buying separately later: Rs. 299 · save Rs. 99 today'
  };

  function showUpsell() {
    if (localStorage.getItem(BUNDLE_OFFERED_KEY)) return;
    var box = document.createElement('div');
    box.className = 'upsell-box';
    box.innerHTML =
      '<p class="eyebrow">ONE-TIME OFFER · 60 SECONDS ONLY</p>' +
      '<h3>' + UPSELL.title + '</h3>' +
      '<p class="upsell-blurb">' + UPSELL.blurb + '</p>' +
      '<div class="upsell-price">' + UPSELL.price + ' <small>' + UPSELL.priceNote + '</small></div>' +
      '<button class="btn btn-primary btn-full upsell-buy" type="button">Yes — add it &amp; unlock both PDFs</button>' +
      '<button class="upsell-nothanks" type="button">No thanks, I\'ll pay Rs. 299 later</button>';
    downloadList.after(box);
    box.querySelector('.upsell-nothanks').addEventListener('click', function () {
      localStorage.setItem(BUNDLE_OFFERED_KEY, '1');
      box.remove();
    });
    box.querySelector('.upsell-buy').addEventListener('click', function () {
      localStorage.setItem(BUNDLE_OFFERED_KEY, '1');
      box.remove();
      startUpsellCheckout();
    });
  }

  async function startUpsellCheckout() {
    var email = localStorage.getItem('sb_last_buyer_email') || '';
    var savedSecret = localStorage.getItem(RECOVERY_SECRET_KEY);
    var savedOrderId = localStorage.getItem(RECOVERY_ORDER_ID_KEY);
    payButton.disabled = true;
    payButton.textContent = 'Creating your add-on order…';
    checkoutStatus.textContent = '';
    checkoutDialog.showModal();
    try {
      var res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: BUNDLE_ID, email: email })
      });
      if (!res.ok) {
        var err = await res.json().catch(function () { return {}; });
        throw new Error(err.error || 'Order creation failed');
      }
      var order = await res.json();
      if (savedSecret && savedOrderId) {
        // Preserve the original recovery pair after the bundle purchase overwrites it.
        localStorage.setItem('sb_prev_recovery_secret', savedSecret);
        localStorage.setItem('sb_prev_recovery_order_id', savedOrderId);
      }
      openRazorpay(order);
    } catch (err) {
      checkoutStatus.textContent = (err && err.message) || 'Unable to create order. Please try again.';
      checkoutStatus.className = 'form-status error';
      payButton.disabled = false;
      payButton.textContent = 'Pay Rs. 299 · Get Instant Access';
    }
  }

  // ---------- success ----------
  function showSuccess(data) {
    successDialog.showModal();
    // remove any stale upsell box from a previous purchase
    var stale = successDialog.querySelector('.upsell-box');
    if (stale) stale.remove();
    if (data.expiresAt) {
      var expiry = new Date(data.expiresAt * 1000);
      expiryDate.textContent = expiry.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    downloadList.innerHTML = '';
    (data.downloads || []).forEach(function (item) {
      var link = document.createElement('a');
      link.href = item.url;
      link.textContent = '⬇ Download your PDF (' + (item.title || '25 Business Ideas') + ')';
      link.addEventListener('click', async function (e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var original = btn.textContent;
        btn.textContent = 'Downloading…';
        try {
          var res = await fetch(item.url);
          if (!res.ok) throw new Error('Download failed');
          var blob = await res.blob();
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = (item.title || '25-business-ideas') + '.pdf';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          btn.textContent = 'Downloaded ✓';
        } catch (err) {
          btn.textContent = 'Download failed — tap to retry';
        }
        setTimeout(function () { btn.textContent = original; }, 4000);
      });
      downloadList.appendChild(link);
    });
    var ids = (data.downloads || []).map(function (d) { return d.id; });
    if (ids.indexOf(PRODUCT_ID) !== -1 && ids.indexOf('ai-pro-guide') === -1) {
      setTimeout(showUpsell, 600);
    }
  }

  // year in footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
