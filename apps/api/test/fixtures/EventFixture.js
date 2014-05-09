/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');


/**
 * models
 */

var Event = require('../../api/models/Event');


/**
 * random object ids
 */

var randomId = '532d6bf862d673ba7131812a';


/**
 * allowed event types
 */

var eventTypes = ['pageview', 'feature'];


/**
 * event names
 */

var eventNames = [
  'Complete Integration',
  'Define Segment',
  'List Users',
  'Create Message',
  'Create Notification',
  'Send Notification'
];


var domainNames = ['dodatado.com', 'userjoy.co'];
var pathNames = ['/messages', '/users', '/install'];
var featureNames = ['Users', 'Messages', 'Onboarding'];


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

  var aFakeEvent = {
    aid: aid,
    cid: randomId,
    uid: uid,
    type: randomFromArray(eventTypes),
    name: randomFromArray(eventNames),
    feature: randomFromArray(featureNames)
  };

  Event.create(aFakeEvent, cb);
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
