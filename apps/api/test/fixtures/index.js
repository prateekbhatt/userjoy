/**
 * Bootstrap the test database
 * before running tests
 */


/**
 * npm dependencies
 */

var async = require('async');
var ObjectId = require('mongoose')
  .Types.ObjectId;


/**
 * models
 */

var Account = require('../../api/models/Account');
var App = require('../../api/models/App');
var Conversation = require('../../api/models/Conversation');
var Message = require('../../api/models/Message');
var User = require('../../api/models/User');


var accounts = {

  first: {
    name: 'Prateek',
    email: 'test@userjoy.co',
    password: 'testtest'
  },

  second: {
    name: 'Savinay',
    email: 'savinay@example.com',
    password: 'newapptest'
  },
},

  apps = {

    first: {
      name: 'First App',
      url: 'firstapp.co'
    },

    second: {
      name: 'Second App',
      url: 'secondapp.co'
    }
  },

  users = {

    first: {
      aid: null,
      email: 'prattbhatt@gmail.com',
    },


    // second user is used in development env for testing the dashboard app
    second: {
      aid: null,
      email: 'savinay.90@gmail.com'
    }

  },

  conversations = {

    first: {
      accId: null,
      aid: null,
      closed: false,
      sub: 'First Conversation!',
      uid: ObjectId()
    },

    second: {
      accId: null,
      aid: null,
      closed: true,
      sub: 'First Conversation!',
      uid: ObjectId()
    }
  },

  messages = {

    first: {
      accid: null,
      aid: null,
      coId: null,
      from: 'user',
      sName: 'Prateek Bhatt',
      sub: 'New Subject',
      text: 'Hello World',
      type: 'email',
      uid: ObjectId(),
    },

    second: {
      accid: null,
      aid: null,
      coId: null,
      from: 'user',
      sName: 'Prateek Bhatt',
      sub: 'New Subject',
      text: 'Hello World',
      type: 'email',
      uid: ObjectId(),
    }
  };


function createAccount(account, fn) {

  var rawPassword = account.password;
  Account.create(account, function (err, acc) {
    if (err) return fn(err);
    acc.password = rawPassword;
    fn(null, acc);
  });

}

function createApp(accid, app, fn) {

  app.team = [];
  app.team.push({
    accid: accid,
    admin: true
  });

  App.create(app, fn);

}


function createUser(aid, user, fn) {
  user.aid = aid;
  User.create(user, fn);
}


function createConversation(accid, aid, uid, con, fn) {
  con.accId = accid;
  con.aid = aid;
  con.uid = uid;
  Conversation.create(con, fn);
}

function createMessage(accid, aid, coId, uid, message, fn) {

  message.accid = accid;
  message.aid = aid;
  message.coId = coId;
  message.uid = uid;
  Message.create(message, fn);

}


module.exports = function loadFixtures(callback) {

  async.series({

    createFirstAccount: function (cb) {

      createAccount(accounts.first, function (err, acc) {
        if (err) return cb(err);
        accounts.first = acc;
        cb();
      });

    },

    createSecondAccount: function (cb) {

      createAccount(accounts.second, function (err, acc) {
        if (err) return cb(err);
        accounts.second = acc;
        cb();
      });

    },

    createFirstApp: function (cb) {

      createApp(accounts.first._id, apps.first, function (err, app) {
        if (err) return cb(err);
        apps.first = app;
        cb();
      });

    },

    createSecondApp: function (cb) {

      createApp(accounts.second._id, apps.second, function (err, app) {
        if (err) return cb(err);
        apps.second = app;
        cb();
      });

    },

    createFirstUser: function (cb) {
      var aid = apps.first._id;
      var newUser = users.first;
      createUser(aid, newUser, function (err, usr) {
        if (err) return cb(err);
        users.first = usr;
        cb();
      });
    },

    createSecondUser: function (cb) {
      var aid = apps.first._id;
      var newUser = users.second;
      createUser(aid, newUser, function (err, usr) {
        if (err) return cb(err);
        users.second = usr;
        cb();
      });
    },

    createFirstConversation: function (cb) {
      var accid = accounts.first._id;
      var aid = apps.first._id;
      var uid = users.first._id;
      var newCon = conversations.first;

      createConversation(accid, aid, uid, newCon, function (err, con) {
        if (err) return cb(err);
        conversations.first = con;
        cb();
      });
    },

    createSecondConversation: function (cb) {
      var accid = accounts.first._id;
      var aid = apps.first._id;
      var uid = users.first._id;
      var newCon = conversations.second;

      createConversation(accid, aid, uid, newCon, function (err, con) {
        if (err) return cb(err);
        conversations.second = con;
        cb();
      });
    },

    createFirstMessage: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var coId = conversations.first._id;
      var uid = users.first._id;
      var message = messages.first;

      createMessage(accid, aid, coId, uid, message, function (err, msg) {
        if (err) return cb(err);
        messages.first = msg;
        cb();
      });

    },

    createSecondMessage: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var coId = conversations.first._id;
      var uid = users.first._id;
      var message = messages.second;

      createMessage(accid, aid, coId, uid, message, function (err, msg) {
        if (err) return cb(err);
        messages.second = msg;
        cb();
      });

    },

  }, function (err) {

    var savedObj = {
      accounts: accounts,
      apps: apps,
      conversations: conversations,
      messages: messages,
      users: users
    };

    callback(err, savedObj);

  });
}
