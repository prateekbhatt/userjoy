/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');
var mongoose = require('mongoose');


/**
 * models
 */

var User = require('../../api/models/User');


/**
 * random object ids
 */

var randomId = mongoose.Types.ObjectId;


/**
 * allowed array values
 */

var billingStatuses = ['trial', 'free', 'paying', 'cancelled'];

var browsers = ['Firefox 25', 'Firefox 26', 'Firefox 27', 'Chrome 25',
  'Internet Explorer 9'
];

var osVals = ["Linux x86_64", 'Windows 8', 'Windows 7', 'Windows XP', 'Unix',
  'Mac OSX'
];

/**
 * possible plans
 */

var plans = ['basic', 'pro', 'premium', 'enterprise'];


/**
 * pick a random value from an array
 * @param  {array} arr input array
 * @return {string}     random value from the array
 */

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


/**
 * a fake company
 */

function genFakeCompany() {
  var aFakeCompany = {
    cid: randomId(),
    name: faker.Company.companyName()
  };
  return aFakeCompany;
}


function getHealthFromScore(score) {

  var h;

  if (score <= 33) {
    h = 'poor';
  } else if (score > 33 && score <= 67) {
    h = 'average';
  } else {
    h = 'good';
  }

  return h;

}


function getTimeDaysAgo(daysAgo) {
  var date = new Date();
  var t = date.getTime();
  t -= daysAgo * 24 * 60 * 60 * 1000; // some time from now to N days ago, in milliseconds
  return new Date(t);
}


/**
 * a fake user
 */

function genFakeUser(aid) {

  var score = faker.Helpers.randomNumber(100);

  var joinedStart = getTimeDaysAgo(100);
  var joinedEnd = getTimeDaysAgo(1);
  var joined = faker.Date.between(joinedStart, joinedEnd);

  var lastSession = faker.Date.between(getTimeDaysAgo(10), getTimeDaysAgo(0));


  var aFakeUser = {

    aid: aid,

    browser: randomFromArray(browsers),

    email: faker.Internet.email(),

    ct: joined,

    joined: joined,

    lastSession: lastSession,

    score: score,

    // billing status
    status: randomFromArray(billingStatuses),

    // health status
    health: getHealthFromScore(score),

    os: randomFromArray(osVals),

    plan: randomFromArray(plans),

    revenue: faker.Helpers.randomNumber(1000),

    companies: [],

    meta: [{
      k: 'name',
      v: faker.Name.firstName() + ' ' + faker.Name.lastName()
    }]

  };

  var noOfCompanies = faker.Helpers.randomNumber(5);

  for (var i = noOfCompanies; i >= 0; i--) {
    aFakeUser.companies.push(genFakeCompany());
  };

  return aFakeUser;
}


/**
 * function which sends a post request to create a new user
 */

function createUser(aid, cb) {

  var user = genFakeUser(aid);

  User.create(user, function (err, usr) {
    if (cb) cb(err, usr);
  });
}


/**
 * load the application and create a set of users in the database
 */

module.exports = function (aid, no, cb) {
  var count = 0;
  var total = no || 100;

  // array of created uids
  var uids = [];

  async.whilst(
    function () {
      return count < total;
    },
    function (cb) {
      count++;
      createUser(aid, function (err, usr) {

        if (usr) {
          uids.push(usr._id.toString());
        }

        cb(err, usr);
      });
    },
    function (err) {

      if (cb) return cb(err, uids);
      process.exit( !! err);
    }
  );
};
