/**
 *
 * NOTE: Overriden the function in this file to send the
 * angular base file instead of the 404 file
 * Check the README.md file in the dashboard app parent directory
 *
 *
 * THE EXPLANATION BELOW IS NOT VALID ANYMORE
 *
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 *
 * NOTE:
 * If no user-defined route, blueprint route, or static file matches
 * the requested URL, Sails will call `res.notFound()`.
 */

// module.exports = function notFound() {

//   // Get access to `req`, `res`, `sails`
//   var req = this.req;
//   var res = this.res;
//   var sails = req._sails;

//   var viewFilePath = '403';
//   var statusCode = 403;
//   var result = {
//     status: statusCode
//   };

//   // If the user-agent wants a JSON response, send json
//   if (req.wantsJSON) {
//     return res.json(result, result.status);
//   }

//   res.status(result.status);
//   res.render(viewFilePath, function(err) {
//     // If the view doesn't exist, or an error occured, send json
//     if (err) {
//       return res.json(result, result.status);
//     }

//     // Otherwise, serve the `views/404.*` page
//     res.render(viewFilePath);
//   });
// };


module.exports = function sendAngularBase() {

  // Get access to `req`, `res`, `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  var viewFilePath = 'homepage.ejs';
  var statusCode = 200;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.render(viewFilePath, function(err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) {
      return res.json(result, result.status);
    }

    // Otherwise, serve the `views/homepage.ejs` page
    res.view(viewFilePath);
  });
};
