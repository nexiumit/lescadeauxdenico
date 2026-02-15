(function () {
  'use strict';

  // Set your GA4 measurement id here or inject window.GA_MEASUREMENT_ID before this script.
  const GA_ID = window.GA_MEASUREMENT_ID || '';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  let analyticsReady = false;

  function initAnalytics() {
    if (!GA_ID) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    document.head.appendChild(s);

    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { send_page_view: true });
    analyticsReady = true;
  }

  window.trackEvent = function trackEvent(eventName, params) {
    if (!analyticsReady || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  };

  initAnalytics();
})();
