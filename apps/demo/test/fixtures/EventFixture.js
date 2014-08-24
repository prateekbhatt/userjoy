/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');
var moment = require('moment');
var mongoose = require('mongoose');


/**
 * models
 */

var Event = require('../../api/models/Event');


/**
 * random object ids
 */

var randomId = mongoose.Types.ObjectId;


/**
 * allowed event types
 */

var eventTypes = ['form', 'link', 'page', 'track'];


/**
 * track event names
 */

var trackEventNames = [
  'Complete Integration',
  'Define Segment',
  'List Users',
  'Create Message',
  'Create Notification',
  'Send Notification'
];


/**
 * pageview event names
 */

var pageviewEventNames = [
  '/account/login',
  '/reports',
  '/signup',
  '/users',
  '/messages/inbox',
  '/messages/automate'
];


var formEvents = [
  'navbar-login',
  'sign-up',
  'add-credit-card',
  'invite-team-member'
];


var linkEvents = [
  'navbar-logout',
  'navbar-logo',
  'benefits-convert'
];


/**
 * pick a random value from an array
 * @param  {array} arr input array
 * @return {string}     random value from the array
 */

function randomFromArray(arr) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}


/**
 * function which sends a post request to create a new event
 */

function createEvent(aid, uid, cb) {

  var fakeEvent = {
    aid: aid,
    cid: randomId(),
    uid: uid,
    ct: moment().subtract('minutes', Math.floor(Math.random() * 100000))
      .format()
  };

  fakeEvent.type = randomFromArray(eventTypes);

  if (fakeEvent.type === 'track') {
    fakeEvent.name = randomFromArray(trackEventNames);
  } else if (fakeEvent.type === 'page') {
    fakeEvent.name = randomFromArray(pageviewEventNames);
  } else if (fakeEvent.type === 'link') {
    fakeEvent.name = randomFromArray(linkEvents);
  } else if (fakeEvent.type === 'form') {
    fakeEvent.name = randomFromArray(formEvents);
  }

  Event.create(fakeEvent, cb);
}


/**
 * load the application and create a set of events in the database
 *
 * @param {string}  aid  app id
 * @param {array} uids array of uids to randomly choose values from
 * @param {number} no number of events to create
 * @param {function} cb callback function
 */

module.exports = function (aid, uids, no, cb) {
  var count = 0;
  var total = no || 100;

  async.whilst(
    function () {
      return count < total;
    },
    function (cb) {
      count++;
      var uid = randomFromArray(uids);
      createEvent(aid, uid, cb);
    },
    function (err) {

      if (cb) return cb(err);
      process.exit( !! err);
    }
  );
};
