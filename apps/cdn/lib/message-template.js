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

  return "<div id=\"" + escape(obj.MSG_OUTER_DIV) + "\">\n    <a style=\"cursor: pointer; display: " + escape(obj.isDisplayed) + ";\" onclick=\"userjoy.showMessageBox()\" id=\"" + escape(obj.MSG_DISPLAY_QMARK) + "\">\n        <div style=\"position: fixed; bottom:30px; right:20px; z-index: 99999999;\">\n            <span style=\"display: inline-block;\n            min-width: 20px;\n            padding: 10px 14px;\n            font-size: 24px;\n            font-weight: 700;\n            color: #fff;\n            line-height: 1;\n            vertical-align: baseline;\n            white-space: nowrap;\n            text-align: center;\n            background-color: " + escape(obj.color) + ";\n            border-radius: 10px;\">&#63;\n            </span>\n        </div>\n    </a>\n    <div style=\"display: none; background: rgba(0, 0, 0, 0.4);\" id=\"" + escape(obj.MSG_TEMPLATE_ID) + "\">\n        <div style=\"position: fixed; right: 9px; z-index: 99999999; top: 50%; left: 50%; margin-left: -225px; height: 1000px; margin-top: -150px;\" class=\"uj-col-md-4\">\n            <div class=\"uj-panel uj-panel-default\" style=\"border-color: #ddd;\">\n                <div class=\"uj-panel-heading\">\n                    <h3 class=\"uj-panel-title\" style=\"text-align: center;\">How may we help you?</h3>\n                    <button type=\"button\" class=\"uj-close\" aria-hidden=\"true\" onclick=\"userjoy.hideMessageBox()\" id=\"close-userjoy-message-box\" style=\"margin-top: -25px;\">&times;</button>\n                </div>\n                <div class=\"uj-panel-body\">\n                    <form role=\"form\">\n                        <textarea id=\"" + escape(obj.MSG_BODY_TEMPLATE_ID) + "\" class=\"uj-form-control\" style=\"padding: 4px; height: 200px; border-color: " + escape(obj.color) + "; box-shadow: none;\"></textarea>\n                        <span style=\"display: none; margin-top: 10px;\" id=\"" + escape(obj.MSG_SENT_TEMPLATE_ID) + "\">\n                        Message sent. Have a wonderful day!</span>\n                        <span id=\"" + escape(obj.MSG_ERROR_ID) + "\" style=\" display:none; color: #a94442; margin-top: 10px;\">\n                        Your message cannot be blank\n                        </span>\n                        <button type=\"button\" class=\"uj-btn uj-btn-sm uj-btn-block\" onclick=\"userjoy.sendConversation()\" style=\"float: right; margin-top: 10px; color: #fff; background-color: " + escape(obj.color) + "; border-color: " + escape(obj.color) + "\" id=\"" + escape(obj.MSG_SEND_FEEDBACK_ID) + "\">Send Message</button>\n                        <div style=\"text-align: center;\">\n                        <small style=\"color: #95a5a6;\">Powered by <a style=\"text-decoration:none; color: " + escape(obj.color) + "\" href=\"https://userjoy.co\", target=\"_blank\">UserJoy</a></small>\n                        </div>\n                    </form>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n"
}