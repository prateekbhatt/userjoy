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

  return "<div>\n    <a style=\"cursor: pointer\" onclick=\"userjoy.showFeedback()\">\n        <div style=\"position: fixed; bottom:30px; right:20px;\">\n            <span style=\"display: inline-block;\n            min-width: 20px;\n            padding: 10px 14px;\n            font-size: 24px;\n            font-weight: 700;\n            color: #fff;\n            line-height: 1;\n            vertical-align: baseline;\n            white-space: nowrap;\n            text-align: center;\n            background-color: " + escape(obj.color) + ";\n            border-radius: 10px;\">&#63;\n            </span>\n        </div>\n    </a>\n    <div style=\"display: none\" id=\"" + escape(obj.MSG_TEMPLATE_ID) + "\">\n        <div style=\"bottom: 80px; position: fixed; right: 9px;\" class=\"uj-col-md-4\">\n            <div class=\"uj-panel uj-panel-default\" style=\"border-color: #ddd;\">\n                <div class=\"uj-panel-heading\">\n                    <h3 class=\"uj-panel-title\" style=\"text-align: center;\">Send us a Message</h3>\n                    <button type=\"button\" class=\"uj-close\" aria-hidden=\"true\" onclick=\"userjoy.hideFeedback()\" id=\"closeFeedback\" style=\"margin-top: -25px;\">&times;</button>\n                </div>\n                <div class=\"uj-panel-body\">\n                    <form role=\"form\">\n                        <textarea id=\"" + escape(obj.MSG_BODY_TEMPLATE_ID) + "\" class=\"uj-form-control\" style=\"padding: 4px; height: 150px;\"></textarea>\n                        <span style=\"display: none; margin-top: 10px;\" id=\"" + escape(obj.MSG_SENT_TEMPLATE_ID) + "\">\n                        Message Sent. Thanks!</span>\n                        <span id=\"" + escape(obj.MSG_ERROR_ID) + "\" style=\" display:none; color: #a94442; margin-top: 10px;\">\n                        Your reply cannot be blank\n                        </span>\n                        <button type=\"button\" class=\"uj-btn uj-btn-sm uj-btn-block\" onclick=\"userjoy.sendConversation()\" style=\"float: right; margin-top: 10px; color: #fff; background-color: " + escape(obj.color) + "; border-color: " + escape(obj.color) + "\">Send Message</button>\n                        <div style=\"text-align: center;\">\n                        <small>Powered by <a style=\"text-decoration:none;\" href=\"http://www.userjoy.co\", target=\"_blank\">UserJoy</a></small>\n                        </div>\n                    </form>\n                </div>\n                <div class=\"uj-arrow\"></div>\n            </div>\n        </div>\n    </div>\n</div>\n"
}
