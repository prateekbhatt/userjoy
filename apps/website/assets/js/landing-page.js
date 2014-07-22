var isVisible = false;
$(window)
  .scroll(function () {
    var shouldBeVisible = $(window)
      .scrollTop() > 370 && $(window)
      .scrollTop() < 1400;
    if (shouldBeVisible && !isVisible) {
      isVisible = true;
      $('#mybutton')
        .show();
    } else if (isVisible && !shouldBeVisible) {
      isVisible = false;
      $('#mybutton')
        .hide();
    }
  });

(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || [])
      .push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
  m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-52772521-1', 'auto');
ga('send', 'pageview');

window.heap = window.heap || [], heap.load = function (t, e) {
  window.heap.appid = t, window.heap.config = e;
  var a = document.createElement("script");
  a.type = "text/javascript", a.async = !0, a.src = ("https:" === document.location
    .protocol ? "https:" : "http:") + "//cdn.heapanalytics.com/js/heap.js";
  var n = document.getElementsByTagName("script")[0];
  n.parentNode.insertBefore(a, n);
  for (var o = function (t) {
    return function () {
      heap.push([t].concat(Array.prototype.slice.call(arguments, 0)))
    }
  }, p = ["identify", "track"], c = 0; c < p.length; c++) heap[p[c]] = o(p[c])
};

if (location.hostname === 'userjoy.co') {
  // in production
  heap.load("1077055861");
} else {
  // dev / test
  heap.load("3435971415");
}
