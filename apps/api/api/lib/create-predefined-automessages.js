/**
 * npm dependencies
 */
var _ = require('lodash');
var async = require('async');


/**
 * Models
 */

var AutoMessage = require('../models/AutoMessage');
var Segment = require('../models/Segment');


/**
 * Create the following predefined automessages:
 *
 *
 */


function createPreDefinedAutoMsg(aid, creatorAccId, cb) {


  function createOneAutoMessage(segmentName, amsg, cb) {

    async.waterfall([

      function fetchSegment(cb) {

        Segment
          .findOne({
            aid: aid,
            name: segmentName
          })
          .select('_id')
          .exec(function (err, seg) {

            if (err) return cb(err);
            if (!seg) return cb(new Error('Predefined segment not found'));

            cb(null, seg._id);

          });

      },


      function createAutoMsg(sid, cb) {

        amsg.sid = sid;

        AutoMessage.create(amsg, cb);

      }


    ], cb);

  }




  var predefinedAutoMsgs = [


    // automessage for Trial Follow Up Day 1
    {

      segmentName: 'Signed up 1 day ago',
      amsg: {
        body: '<p>Hi {{=user.name || "there"}},</p><p></p><p>I wanted to reach out to see if you had any questions about getting started. I \'m here to help, simply reply to this email if you need any assistance.</p><p></p><p>I look forward to hearing from you.</p><p><br/></p> ',
        sub: 'Welcome',
        title: 'Welcome Message'
      }
    },

    {
      segmentName: 'Signed up 3 days ago',
      amsg: {
        body: '<p>Hi {{=user.name || "there"}},</p><p></p><p>Thank you for signing up for our free trial. We hope you managed to use our product for a while now. Just wanted to find out if you have questions for us.&#160;</p><p></p><p>Feel free to reply to this email if you have any questions about the product. We love hearing from our customers</p>  ',
        sub: 'How is your trial going?',
        title: 'Message sent after 3 days'
      }
    },

    {
      segmentName: 'Signed up 7 days ago',
      amsg: {
        body: ' <p>Hi {{=user.name || "there"}},</p><p>Just touching base to find out how has been your trial so far. If you are facing any problems, feel free to let us know. We will be glad to help you out.</p>  ',
        sub: 'Facing Problems?',
        title: 'Message sent after 7 days'
      }
    }


  ];




  async.each(

    predefinedAutoMsgs,

    function iterator(def, cb) {

      var amsg = def.amsg;
      var segmentName = def.segmentName;

      amsg.type = "email";
      amsg.aid = aid;
      amsg.creator = creatorAccId;
      amsg.sender = creatorAccId;

      createOneAutoMessage(segmentName, amsg, cb);
    },

    cb

  );



}

module.exports = createPreDefinedAutoMsg;
