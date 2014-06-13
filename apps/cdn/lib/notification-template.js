module.exports = function anonymous(obj) {

  function escape(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  function section(obj, prop, negate, str) {
    var val = obj[prop];
    if ('function' == typeof val) return val.call(obj, str);
    if (negate) val = !val;
    if (val) return str;
    return '';
  };

  return "<div id=\"" + escape(obj.NOTIFICATION_TEMPLATE_ID) + "\" style=\"position: relative;\">\n    <div style=\"float:right; width: 350px;\">\n        <div class=\"uj-message-template\" style=\"min-height: 175px; overflow: auto; border-color: " + escape(obj.color) + "; border-right: 1px solid " + escape(obj.color) + ";border-top: 1px solid " + escape(obj.color) + "; border-bottom: 1px solid " + escape(obj.color) + "; border-radius: 4px;\">\n            <button type=\"button\" class=\"uj-close\" aria-hidden=\"true\" onclick=\"userjoy.hideNotification()\" style=\"margin-top: -15px;\">&times;</button>\n            <img src=\"" + escape(obj.gravatar) + "\" width=\"60px\">\n            <div style=\"margin-top: -75px; margin-left: 75px;\">\n                <p><b>" + escape(obj.sender) + "</b></p>\n                <p>" + escape(obj.body) + "</p>\n            </div>\n            <span id=\"" + escape(obj.SENT_TEMPLATE_ID) + "\" style=\"bottom: -180px; display:none; color: #7f8c8d; position: absolute;\">Message Sent. Thanks!</span>\n            <span id=\"" + escape(obj.ERROR_ID) + "\" style=\"bottom: -180px; display:none; color: #a94442; position: absolute;\">Your reply cannot be blank</span>\n        </div>\n        <div class=\"uj-panel-footer\" style=\"margin-top: -23px;\">\n            <div class=\"uj-input-group\">\n                <textarea id=\"" + escape(obj.REPLY_TEMPLATE_ID) + "\" type=\"text\" name=\"msg\" class=\"uj-form-control uj-input-sm\" placeholder=\"Type your message here...\" style=\"margin-top: 3px; height: 34px;\"></textarea>\n                <span class=\"uj-input-group-btn\">\n                <button class=\"uj-btn uj-btn-sm\" id=\"btn-chat\" type=\"button\" onclick=\"userjoy.replyNotification()\" style=\"margin-top: 3px; height: 34px; color: #fff; background-color: " + escape(obj.color) + "; border-color: " + escape(obj.color) + "\">\n                Send</button>\n                </span>\n            </div>\n        </div>\n    </div>\n</div>\n"
}