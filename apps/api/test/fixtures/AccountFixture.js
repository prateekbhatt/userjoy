/**
 * npm dependencies
 */

var async = require('async');
var faker = require('Faker');


/**
 * models
 */

var Account = require('../../api/models/Account');


/**
 * random object ids
 */

var randomId = '532d6bf862d673ba7131812a';


/**
 * pick a random value from an array
 * @param  {array} arr input array
 * @return {string}     random value from the array
 */

function randomFromArray(arr) {
  return arr[Math.round(Math.random() * arr.length)];
}


/**
 * a fake account
 */

function genFakeAccount(aid) {

  var aFakeAccount = {

    aid: aid || randomId,

    email: faker.Internet.email(),

    totalSessions: faker.Helpers.randomNumber(10000),

    ct: faker.Date.recent(10000),

    lastSessionAt: faker.Date.recent(10),

    healthScore: faker.Helpers.randomNumber(100),

    // billing data is stored in both company and account models
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
    aFakeAccount.companies.push(genFakeCompany());
  };

  return aFakeAccount;
}


/**
 * function which sends a post request to create a new account
 */

function createAccount(aid, cb) {

  var account = genFakeAccount(aid);

  Account.create(account, function (err, acc) {
    if (cb) cb(err, acc);
  });
}


/**
 * load the application and create a set of accounts in the database
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
      createAccount(aid, cb);
    },
    function (err) {

      if (cb) return cb();
      process.exit(!!err);
    }
  );
};
