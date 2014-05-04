/**
 * npm dependencies
 */

var _ = require('lodash');
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
    Conversation.closed(coId, function (err, msg) {
      if (err) return next(err);

      res
        .status(200)
        .json(msg);
    });

  });


/**
 * PUT /apps/:aid/conversations/:coId/reopened
 *
 * Reopens closed conversation
 */

router
  .route('/:aid/conversations/:coId/reopened')
  .put(function (req, res, next) {

    var aid = req.params.aid;
    var coId = req.params.coId;

    if (!(aid && coId)) {
      return res.badRequest('Provide valid aid/coId');
    }


    // TODO: also take the aid as an input param as an additional check
    Conversation.reopened(coId, function (err, msg) {
      if (err) return next(err);

      res
        .status(200)
        .json(msg);
    });

  });


/**
 * GET /apps/:aid/conversations/:coId
 *
 * Returns a conversation alongwith all messages
 */

router
  .route('/:aid/conversations/:coId')
  .get(function (req, res, next) {

    var aid = req.app._id;
    var coId = req.params.coId;

    async.waterfall(
      [

        function findConversation(cb) {
          Conversation
            .findById(coId)
            .exec(cb);
        },

        function findMessages(con, cb) {
          Message
            .find({
              coId: coId
            })
            .sort({
              ct: -1
            })
            .exec(function (err, messages) {
              cb(err, con, messages)
            });
        },

        function areOpened(con, messages, cb) {
          var mIds = _.pluck(messages, '_id');

          // update seen status to true for all messages sent from user, which
          // belong to this thread
          Message.openedByTeamMember(mIds, function (err) {
            cb(err, con, messages);
          });
        }

      ],

      function (err, con, messages) {

        if (err) return next(err);

        con = con.toJSON();
        con.messages = messages;

        res.json(con);
      }

    );

  });



module.exports = router;
