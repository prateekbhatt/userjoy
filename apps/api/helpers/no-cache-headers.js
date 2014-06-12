/**
 * Middleware to tell the browser / server not to cache to request
 *
 * REF: http://stackoverflow.com/a/20429914/1463434
 */

module.exports = function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}
