/**
 * npm dependencies
 */

var async = require('async');
var router = require('express')
  .Router();


/**
 * Models
 */

var Conversation = require('../models/Conversation');
var Message = require('../models/Message');
var User = require('../models/User');


/**
 * Policies
 */

var hasAccess = require('../policies/hasAccess');
var isAuthenticated = require('../policies/isAuthenticated');


/**
 * All routes on /apps
 * need to be authenticated
 */

router.use(isAuthenticated);


/**
 * For all routes with the ':aid'
 * param, we need to check if the
 * logged in user has access to the app
 *
 * The 'hasAccess' policy also attaches the
 * app object to the request object
 * e.g. req.app
 */

router.param('aid', hasAccess);


/**
 * PUT /apps/:aid/conversations/:coId/closed
 *
 * Closes the conversation
 */

router
  .route('/:aid/conversations/:coId/closed')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var coId = req.params.coId;

    if (!(aid && coId)) {
      return res.badRequest('Provide valid aid/coId');
    }


    // TODO: also take the aid as an input param as an additional check
    Conversation.close(coId, function (err, msg) {
      if (err) return next(err);

      res
        .status(200)
        .json(msg);
    });

  });


module.exports = router;
