// Meta Pixel base integration. Pixel IDs are public identifiers, not secrets.
(function initMetaPixel(window, document) {
  'use strict';

  const pixelId = '4274320466213389';

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };

    window.fbq = fbq;
    window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  window.trackMetaEvent = function trackMetaEvent(eventName, parameters, eventId) {
    if (!window.fbq) return;
    if (eventId) {
      window.fbq('track', eventName, parameters, { eventID: String(eventId) });
      return;
    }
    window.fbq('track', eventName, parameters);
  };
})(window, document);
