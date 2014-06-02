var ajax = require('ajax');
var bind = require('bind');
var template = require('./feedback-template');


/**
 * Initialize a new `Feedback` instance.
 */

function Feedback() {
  this.fb_url = 'TODO';
  this.fb_template_id = 'uj_fb';
  this.userId = null;
}

Feedback.prototype.load = function (userId) {

  var self = this;


  self.userId = userId;

  function create(htmlStr) {
    var frag = document.createDocumentFragment(),
      temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    return frag;
  }

  // var locals = {
  //     msg: 'This is the message to be shown to the user',
  //     notification_template_id: self.notification_template_id
  // };

  var fragment = create(template());



  // You can use native DOM methods to insert the fragment:
  document.body.insertBefore(fragment, document.body.childNodes[0]);

};


Feedback.prototype.loadCss = function () {

  var self = this;

  // var style = document.createElement('link');
  // style.rel = 'text/stylesheet';
  // style.async = true;
  // style.url = 'userjoy.css';
  // var first = document.getElementsByTagName('link')[0];
  // first.parentNode.insertBefore(style, first);
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'lib/custom-css.js';
  head.appendChild(script);

};


Feedback.prototype.show = function () {
  if(document.getElementById('feedback').style.display == 'none') {
    document.getElementById('feedback')
      .style.display = 'block';
  } else {
    document.getElementById('feedback')
      .style.display = 'none';
  }  
};


Feedback.prototype.hide = function () {
  document.getElementById('feedback')
    .style.display = 'none';
};


Feedback.prototype.send = function () {

  var data = {
    reply: document.getElementById('reply')
      .value
  }
  ajax({
    type: "POST",
    url: '/apps/aid/fb/uid',
    data: data,
    success: function () {
      document.getElementById('msgsent')
        .style.display = 'block';
      document.getElementById('reply')
        .value = '';
    },
    error: function () {
      console.log("error");
    },
    dataType: 'json'
  });

};


/**
 * Expose `Feedback` instance.
 */

module.exports = bind.all(new Feedback());