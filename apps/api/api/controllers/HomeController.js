/**
 * HomeController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	index: function (req, res) {
    res.json({
      message: 'Welcome to DoDataDo API'
    });
  }
};
