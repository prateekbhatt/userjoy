/**
 * Checks if the user is authenticated
 * to access the given route
 */

module.exports = function isAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {
    return next();
  }

  res.unauthorized();

}
