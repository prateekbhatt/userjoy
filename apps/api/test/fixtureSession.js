/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');


/**
 * models
 */

var Session = require('../api/models/Session');


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
 * browser types
 */

var browserTypes = ['firefox', 'chrome', 'opera', 'ie'];


/**
 * platform types
 */

var platformTypes = ['android', 'ios', 'macintosh', 'linux', 'windows'];


/**
 * device types
 */

var deviceTypes = ['mobile', 'tablet', 'desktop'];


/**
 * pick a random value from an array
 * @param  {array} arr input array
 * @return {string}     random value from the array
 */

function randomFromArray(arr) {
  return arr[Math.round(Math.random() * (arr.length - 1))];
}


/**
 * a fake event
 */

function genFakeEvent() {
  var aFakeEvent = {
    t: randomFromArray(eventTypes),
    n: randomFromArray(eventNames),
    d: randomFromArray(domainNames),
    p: randomFromArray(pathNames),
    f: randomFromArray(featureNames)
  };
  return aFakeEvent;
}


/**
 * a fake session
 */

function genFakeSession(aid) {

  var aFakeSession = {

    aid: aid,
    br: randomFromArray(browserTypes),
    brv: faker.Helpers.randomNumber(50),
    ci: faker.Address.city(),
    cid: randomId,
    co: faker.Address.ukCountry(),
    dv: randomFromArray(deviceTypes),
    ev: [],
    ip: faker.Internet.ip(),
    pl: randomFromArray(platformTypes),
    uid: randomId

  };

  var noOfEvents = faker.Helpers.randomNumber(50);

  for (var i = noOfEvents; i >= 0; i--) {
    var newEvent = genFakeEvent();
    aFakeSession.ev.push(newEvent);
  };

  return aFakeSession;
}


/**
 * function which sends a post request to create a new session
 */

function createSession(aid, cb) {

  var session = genFakeSession(aid);

  Session.create(session, cb);
}


/**
 * load the application and create a set of sessions in the database
 */

module.exports = function (aid, no, cb) {
  var count = 0;
  var total = no || 100;

  async.whilst(
    function () {
      return count < total;
    },
    function (cb) {
      count++;
      createSession(aid, cb);
    },
    function (err) {

      if (cb) return cb();
      process.exit( !! err);
    }
  );
};
