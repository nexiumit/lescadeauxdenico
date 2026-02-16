// Microsoft Clarity setup.
// Add your Clarity project ID below (example: "pxxxxxxxx").
window.CLARITY_PROJECT_ID = 'vi58gnjhd9';

(function () {
  'use strict';

  // Keep compatibility with existing tracking calls in the site.
  window.trackEvent = function trackEvent(eventName) {
    if (typeof window.clarity === 'function' && eventName) {
      window.clarity('event', String(eventName));
    }
  };

  if (!window.CLARITY_PROJECT_ID) return;

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', window.CLARITY_PROJECT_ID);
})();
