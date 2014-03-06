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
})(window, document, 'script',
    '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-48552179-1', 'dodatado.com');
ga('send', 'pageview');