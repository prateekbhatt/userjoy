/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');


/**
 * models
 */

var User = require('../../api/models/User');


/**
 * random object ids
 */

var randomId = '532d6bf862d673ba7131812a';


/**
 * allowed billing status values
 */

var statuses = ['trial', 'free', 'paying', 'cancelled'];


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
    cid: randomId,
    name: faker.Company.companyName()
  };
  return aFakeCompany;
}


/**
 * a fake user
 */

function genFakeUser(aid) {

  var aFakeUser = {

    appId: aid,

    email: faker.Internet.email(),

    totalSessions: faker.Helpers.randomNumber(10000),

    createdAt: faker.Date.recent(10000),

    lastSessionAt: faker.Date.recent(10),

    healthScore: faker.Helpers.randomNumber(100),

    // billing data is stored in both company and user models
    billing: {
      status: randomFromArray(statuses),

      plan: randomFromArray(plans),

      currency: 'USD',

      amount: faker.Helpers.randomNumber(1000)
    },

    companies: []

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
      process.exit(!!err);
    }
  );
};
