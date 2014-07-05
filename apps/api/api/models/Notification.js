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


  // sender email (account)
  senderEmail: {
    type: String,
    required: [true, 'Provide sender email']
  },


  // sender name (account)
  senderName: {
    type: String,
    required: [true, 'Provide sender name']
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
 * Add indexes
 */

NotificationSchema.index({
  uid: 1
});


var Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
