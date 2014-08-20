/**
 * npm dependencies
 */

var ejs = require('ejs');


/**
 * Apply custom delimiters to ejs
 * REF: https://github.com/visionmedia/ejs#custom-delimiters
 */

ejs.open = '{{';
ejs.close = '}}';


/**
 * render a file
 *
 * @param {string} path file-path of template
 * @param {object} locals variables to be passed into the template
 * @param {function} cb callback
 */

exports.file = function (path, locals, cb) {
  ejs.renderFile(path, locals, cb);
};


/**
 * render a string
 *
 * @param {string} string template
 * @param {object} locals variables to be passed into the template
 *
 * @return {string} rendered html
 */

exports.string = function (string, locals) {
  var html = ejs.render(string, locals);
  return html;
};
