/**
 * Model for notifications belonging to an app
 *
 * NOTE: This contains only auto notifications. Notifications that are manually
 * created by the admin are stored in the Message collection.
 */


/**
 * npm dependencies
 */

var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var troop = require('mongoose-troop');

var Schema = mongoose.Schema;


/**
 * Define notification schema
 */

var NotificationSchema = new Schema({


  // automessage Id
  amId: {
    type: Schema.Types.ObjectId,
    ref: 'AutoMessage',
    required: [true, 'Invalid automessage id']
  },


  // notification body
  body: {
    type: String,
    required: [true, 'Provide notification body']
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // has the notification been seen by the user
  seen: {
    type: Boolean,
    default: false
  },


  // sender name (account)
  sender: {
    type: String
  },


  // the automessage title
  title: {
    type: String,
    required: [true, 'Provide notification title']
  },


  // user Id
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid uid']
  }

});


/**
 * Updates seen status to true
 *
 * @param {string} id notification-id
 * @param {function} cb callback
 */

NotificationSchema.statics.opened = function (id, cb) {

  var update = {
    $set: {
      seen: true
    }
  };

  Notification.findByIdAndUpdate(id, update, function (err, msg) {
    if (err) return cb(err);
    if (!msg) return cb('Notification was not found');
    cb(null, msg);
  });

};


var Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
