var app = require('./app');
var ajax = require('ajax');
var bind = require('bind');
var debug = require('debug')('uj:message');
var dom = require('dom');
var template = require('./message-template');
var user = require('./user');


/**
 * Constants
 */

var MSG_TEMPLATE_ID = 'uj_message';
var MSG_BODY_TEMPLATE_ID = 'uj_message_body';
var MSG_SENT_TEMPLATE_ID = 'uj_message_sent';
var MSG_ERROR_ID = 'uj_message_error';
var MSG_SEND_FEEDBACK_ID = 'uj_message_send_button'


/**
 * Initialize a new `Message` instance.
 */

  function Message() {

    this.debug = debug;

  }


Message.prototype.load = function () {

  this.debug('loading ...');

  var self = this;
  var appTraits = app.traits();

  var locals = {
    MSG_TEMPLATE_ID: MSG_TEMPLATE_ID,
    MSG_BODY_TEMPLATE_ID: MSG_BODY_TEMPLATE_ID,
    MSG_SENT_TEMPLATE_ID: MSG_SENT_TEMPLATE_ID,
    MSG_ERROR_ID: MSG_ERROR_ID,
    MSG_SEND_FEEDBACK_ID: MSG_SEND_FEEDBACK_ID,
    color: appTraits.color
  };

  dom('body')
    .prepend(template(locals));

};


Message.prototype.loadCss = function () {

  var self = this;

  self.debug('loading css ...');

  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML =
    '.uj-foot{display:table-row;vertical-align:bottom;height:1px}#uj-wrap{min-height:100%}#uj-main{overflow:auto;padding-bottom:150px}#uj-footer{position:relative;margin-top:-150px;height:150px;clear:both}#uj-page-wrap{width:75%;margin:80px auto}.uj-form-control{height:43px;padding:10px 15px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075);-webkit-transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}.uj-message-template{margin:20px 0;padding:20px;border-left:1px solid #eee}.uj-message-template-danger{border-color:#d9534f;border-right:1px solid #d9534f;border-top:1px solid #d9534f;border-bottom:1px solid #d9534f;border-radius:4px}.uj-message-template-warning{background-color:#fcf8f2;border-color:#f0ad4e;border-right:1px solid #fcf8f2;border-top:1px solid #fcf8f2;border-bottom:1px solid #fcf8f2;border-radius:4px}.uj-message-template-info{background-color:#f4f8fa;border-color:#5bc0de;border-right:1px solid #f4f8fa;border-top:1px solid #f4f8fa;border-bottom:1px solid #f4f8fa;border-radius:4px}.uj-message-template-success{background-color:#F4FDF0;border-color:#3C763D;border-right:1px solid #F4FDF0;border-top:1px solid #F4FDF0;border-bottom:1px solid #F4FDF0;border-radius:4px}.uj-message-template-default{background-color:#EEE;border-color:#B4B4B4;border-right:1px solid #EEE;border-top:1px solid #EEE;border-bottom:1px solid #EEE;border-radius:4px}.uj-message-template-notice{background-color:#FCFCDD;border-color:#BDBD89;border-right:1px solid #FCFCDD;border-top:1px solid #FCFCDD;border-bottom:1px solid #FCFCDD;border-radius:4px}.uj-dropdown-menu>li>a{display:block;padding:3px 20px;clear:both;font-weight:400;line-height:1.42857143;color:#7b8a8b;white-space:nowrap}.uj-message-email-success{border-color:#BDBD89;border-right:1px solid #bdc3c7;border-top:1px solid #bdc3c7;border-bottom:1px solid #bdc3c7;border-radius:4px}.uj-input-group{position:relative;display:table;border-collapse:separate}.uj-panel-footer{padding:10px 15px;background-color:#ecf0f1;border-top:1px solid #ecf0f1;border-bottom-right-radius:3px;border-bottom-left-radius:3px}.uj-input-sm{height:18px;padding:6px 9px;font-size:13px;line-height:1.5;border-radius:3px}.uj-form-control:focus{border-color:#66afe9;outline:0;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6);box-shadow:inset 0 1px 1px rgba(0,0,0,.075),0 0 8px rgba(102,175,233,.6)}.uj-btn{display:inline-block;cursor:pointer;padding:10px 15px;font-size:15px;line-height:1.42857143;border-radius:4px;-moz-user-select:none;-ms-user-select:none;user-select:none}.uj-btn-danger{color:#fff;background-color:#e74c3c;border-color:#e74c3c}.uj-input-group .uj-form-control{position:relative;float:left;width:100%;margin-bottom:0}.uj-input-group-btn{position:relative;font-size:0}.uj-input-group-addon,.uj-input-group-btn{width:1%;white-space:nowrap;vertical-align:middle}.uj-input-group .uj-form-control,.uj-input-group-addon,.uj-input-group-btn{display:table-cell}.uj-input-group-btn>.uj-btn{position:relative}.uj-close{float:right;font-size:21px;font-weight:700;line-height:1;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20)}.uj-close:focus,.uj-close:hover{color:#000;text-decoration:none;cursor:pointer;opacity:.5;filter:alpha(opacity=50)}button.uj-close{padding:0;cursor:pointer;background:0 0;border:0;-webkit-appearance:none}.uj-badge{display:inline-block;min-width:20px;padding:10px 14px;font-size:24px;font-weight:700;color:#fff;line-height:1;vertical-align:baseline;white-space:nowrap;text-align:center;background-color:#5bc0de;border-radius:10px}.uj-panel-default{color:#333;background-color:#bdc3c7}.uj-panel-heading{background-color:#f5f5f5}.uj-col-md-4{width:450px}.uj-row{margin-left:-15px;margin-right:-15px}.uj-arrow:before{content:"";position:absolute;left:296px;border-style:solid;border-width:17px 17px 0;border-color:#ddd transparent;display:block;width:0;z-index:0}*{box-sizing:border-box}.uj-panel-default{border-color:#ddd}.uj-panel{margin-bottom:20px;background-color:#fff;border:1px solid transparent;border-radius:4px;box-shadow:0 1px 1px rgba(0,0,0,.05)}.uj-panel-default>.uj-panel-heading{color:#333;background-color:#f5f5f5;border-color:#ddd}.uj-panel-heading{padding:10px 15px;border-bottom:1px solid transparent;border-top-right-radius:3px;border-top-left-radius:3px}.uj-panel-title{margin-top:0;margin-bottom:0;font-size:16px;color:inherit}.uj-panel-body{padding:15px}.uj-form-control{display:block;width:100%;font-size:14px;line-height:1.42857143;color:#555;background-color:#fff;background-image:none;border:1px solid #ccc;border-radius:4px;box-shadow:inset 0 1px 1px rgba(0,0,0,.075);transition:border-color ease-in-out .15s,box-shadow ease-in-out .15s}.uj-btn-block{display:block;width:100%;padding-left:0;padding-right:0}.uj-btn-group-sm>.uj-btn,.uj-btn-sm{padding:5px 10px;font-size:12px;line-height:1.5;border-radius:3px}.uj-btn-info{color:#fff;background-color:#5bc0de;border-color:#46b8da}.uj-btn{margin-bottom:0;font-weight:400;text-align:center;vertical-align:middle;background-image:none;border:1px solid transparent;white-space:nowrap;-webkit-user-select:none}';

  dom('head')
    .prepend(style);

};


Message.prototype.show = function () {

  this.debug('opening ...');

  document.getElementById(MSG_TEMPLATE_ID)
    .style.display = (document.getElementById(MSG_TEMPLATE_ID)
      .style.display === 'none') ? 'block' : 'none';

  document.getElementById(MSG_SENT_TEMPLATE_ID)
    .style.display = 'none';
  document.getElementById(MSG_ERROR_ID)
    .style.display = 'none';
  document.getElementById(MSG_BODY_TEMPLATE_ID)
    .focus();

};


Message.prototype.hide = function () {

  this.debug('closing ...');

  var id = MSG_TEMPLATE_ID;

  document.getElementById(id)
    .style.display = 'none';

};


Message.prototype.send = function () {

  var self = this;

  var appTraits = app.traits();
  var userTraits = user.traits();
  var app_id = appTraits.app_id;
  var MSG_POST_URL = appTraits.CONVERSATION_URL;
  var user_id = userTraits.user_id;
  var email = userTraits.email;

  var msgBody = dom('#' + MSG_BODY_TEMPLATE_ID)
    .val();

  if (!msgBody) {
    document.getElementById(MSG_ERROR_ID)
      .style.display = 'block';
    return;
  }

  document.getElementById(MSG_SEND_FEEDBACK_ID)
    .disabled = true;

  var msg = {
    app_id: app_id,
    body: msgBody
  };

  if (user_id) {
    msg.user_id = user_id;
  } else if (email) {
    msg.email = email;
  } else {

    self.debug('ERROR while sending: no user_id or email to identify user');
    return;
  }

  self.debug('sending ... %o', msg);

  ajax({
    type: "POST",
    url: MSG_POST_URL,
    data: msg,
    dataType: 'json',

    success: function (saved) {

      self.debug('sent successfully');

      document.getElementById(MSG_SENT_TEMPLATE_ID)
        .style.display = 'block';
        
      document.getElementById(MSG_ERROR_ID)
        .style.display = 'none';

      document.getElementById(MSG_TEMPLATE_ID)
        .value = '';

      document.getElementById(MSG_BODY_TEMPLATE_ID)
        .value = '';

      document.getElementById(MSG_SEND_FEEDBACK_ID)
        .disabled = false;

      setTimeout(function () {
        document.getElementById(MSG_TEMPLATE_ID)
          .style.display = 'none';
      }, 2000);
    },

    error: function (err) {
      self.debug("ERROR on sending: %o", err);
      document.getElementById(MSG_SEND_FEEDBACK_ID)
        .disabled = false;
    }
  });

};


/**
 * Expose `Message` instance.
 */

module.exports = bind.all(new Message());