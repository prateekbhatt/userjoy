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

  return "<div>\n    <a style=\"cursor: pointer\" onclick=\"userjoy.showFeedback()\">\n        <div style=\"position: fixed; bottom:30px; right:20px;\">\n            <span style=\"display: inline-block;\n            min-width: 20px;\n            padding: 10px 14px;\n            font-size: 24px;\n            font-weight: 700;\n            color: #fff;\n            line-height: 1;\n            vertical-align: baseline;\n            white-space: nowrap;\n            text-align: center;\n            background-color: #5bc0de;\n            border-radius: 10px;\">&#63;\n            </span>\n        </div>\n    </a>\n    <div style=\"display: none\" id=\"" + escape(obj.MSG_TEMPLATE_ID) + "\">\n        <div style=\"bottom: 80px; position: fixed; right: 9px;\" class=\"col-md-4\">\n            <div class=\"panel panel-default\" style=\"border-color: #ddd;\">\n                <div class=\"panel-heading\">\n                    <h3 class=\"panel-title\" style=\"text-align: center;\">Send us a Message</h3>\n                    <button type=\"button\" class=\"close\" aria-hidden=\"true\" onclick=\"userjoy.hideFeedback()\" id=\"closeFeedback\" style=\"margin-top: -25px;\">&times;</button>\n                </div>\n                <div class=\"panel-body\">\n                    <form role=\"form\">\n                        <textarea id=\"" + escape(obj.MSG_BODY_TEMPLATE_ID) + "\" class=\"form-control\" style=\"padding: 4px; height: 150px;\"></textarea>\n                        <br>\n                        <button type=\"button\" class=\"btn btn-sm btn-info btn-block\" onclick=\"userjoy.sendConversation()\" style=\"float: right;\">Send Message</button>\n                        <hr>\n                        <div style=\"text-align: center;\">\n                        <small>Powered by <a style=\"text-decoration:none;\" href=\"http://www.userjoy.co\", target=\"_blank\">UserJoy</a></small>\n                        </div>\n                    </form>\n                </div>\n                <div class=\"arrow\"></div>\n            </div>\n        </div>\n    </div>\n</div>\n"
}