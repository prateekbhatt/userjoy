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
 * allowed billing status values
 */

var billingStatuses = ['trial', 'free', 'paying', 'cancelled'];
var healthStatuses = ['good', 'average', 'poor'];


/**
 * possible plans
 */

var plans = ['basic', 'pro', 'propro', 'premium', 'enterprise'];


/**
 * pick a random value from an array
 * @param  {array} arr input array
 * @return {string}     random value from the array
 */

function randomFromArray(arr) {
  return arr[Math.round(Math.random() * arr.length)];
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


/**
 * a fake user
 */

function genFakeUser(aid) {

  var aFakeUser = {

    aid: aid,

    email: faker.Internet.email(),

    totalSessions: faker.Helpers.randomNumber(10000),

    ct: faker.Date.recent(10000),

    lastSessionAt: faker.Date.recent(10),

    score: faker.Helpers.randomNumber(100),

    // billing status
    status: randomFromArray(billingStatuses),

    // health status
    health: randomFromArray(healthStatuses),

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
