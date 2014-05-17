/**
 * Model for notifications belonging to an app
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


  accid: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Invalid account id']
  },


  // app Id
  aid: {
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: [true, 'Invalid aid']
  },


  // created at timestamp
  ct: {
    type: Date,
    default: Date.now
  },


  // notification body
  body: {
    type: String,
    required: [true, 'Provide notification body']
  },


  // notification title (this will appear on the admin dashboard)
  title: {
    type: String,
    required: [true, 'Provide notification title']
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


  // user Id
  uid: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Invalid uid']
  },


  // updated at timestamp
  ut: {
    type: Date,
    default: Date.now
  }

});


/**
 * Adds updated (ut) timestamps
 * Created timestamp (ct) is added by default
 */

NotificationSchema.pre('save', function (next) {
  this.ut = new Date;
  next();
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
