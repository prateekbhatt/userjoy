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

  return "<div id=\"" + escape(obj.notification_template_id) + "\" style=\"position: relative;\">\n    <div style=\"float:right; width: 350px;\">\n        <div class=\"message-template message-template-danger\" style=\"min-height: 175px; overflow: auto;\">\n            <button type=\"button\" class=\"close\" aria-hidden=\"true\" onclick=\"userjoy.hideNotification()\" id=\"closeNotification\">&times;</button>\n            <p>" + escape(obj.msg) + "</p>\n            <span id=\"msgsent\" style=\"margin-top: 140px; display:none; color: #7f8c8d\">Message Sent. Thanks!</span>\n        </div>\n        <div class=\"panel-footer\" style=\"margin-top: -23px;\">\n            <div class=\"input-group\">\n                <input id=\"reply\" type=\"text\" name=\"msg\" class=\"form-control input-sm\" placeholder=\"Type your message here...\" style=\"margin-top: 3px; height: 30px;\" />\n                <span class=\"input-group-btn\">\n                <button class=\"btn btn-danger btn-sm\" id=\"btn-chat\" type=\"button\" onclick=\"userjoy.replyNotification()\" style=\"margin-top: 2px; height: 30px;\">\n                Send</button>\n                </span>\n            </div>\n        </div>\n    </div>\n</div>"
}