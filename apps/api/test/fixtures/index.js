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
var AutoMessage = require('../../api/models/AutoMessage');
var Conversation = require('../../api/models/Conversation');
var Invite = require('../../api/models/Invite');
var Notification = require('../../api/models/Notification');
var Segment = require('../../api/models/Segment');
var User = require('../../api/models/User');
var UserNote = require('../../api/models/UserNote');


/**
 * Helpers
 */

var logger = require('../../helpers/logger');


/**
 * Fixtures
 */

var accounts = {

  first: {
    name: 'Prateek',
    email: 'prattbhatt@gmail.com',
    password: 'testtest'
  },

  second: {
    name: 'Savinay',
    email: 'prateek@dodatado.com',
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
      meta: [{
        k: 'name',
        v: 'Prat'
      }]
    },


    // second user is used in development env for testing the dashboard app
    second: {
      aid: null,
      email: 'savinay.90@gmail.com'
    }

  },

  conversations = {

    first: {
      assignee: null,
      aid: null,
      messages: [

        {
          body: 'Hello World',
          from: 'user',
          sName: 'Prateek',
          type: 'email'
        },

        {
          accid: null,
          body: 'Hello World 2',
          from: 'account',
          sName: 'Prateek2',
          type: 'email'
        }
      ],
      sub: 'First Conversation!',
      uid: ObjectId()
    },

    second: {
      assignee: null,
      aid: null,
      messages: [{
        body: 'Hello World 2',
        from: 'account',
        sName: 'Prateek2',
        type: 'notification'
      }],
      closed: true,
      sub: 'First Conversation!',
      toRead: true,
      uid: ObjectId()
    }
  };

var invites = {

  first: {
    aid: null,
    from: null,
    toEmail: accounts.second.email,
    toName: 'Prats'
  }
};


var notifications = {

  first: {
    accid: null,
    aid: null,
    amId: null,
    sender: 'Prateek Bhatt',
    title: 'New Title for Notification',
    body: 'Hello World',
    uid: null,
  }
};


var segments = {
  first: {
    aid: null,
    creator: null,
    list: 'users',
    name: 'First segment',
    op: 'and',
    filters: [

      {
        method: 'hasdone',
        type: 'feature',
        name: 'Create Notification'
      }

    ]
  }
};

var usernotes = {

  first: {
    aid: null,
    creator: null,
    note: 'This user sucks ! :(',
    uid: null,
  },


  second: {
    aid: null,
    creator: null,
    note: 'He needs onboarding assistance',
    uid: null
  }

};

var automessages = {

  first: {
    aid: null,
    body: 'Hey, Welkom to CabanaLand!',
    creator: null,
    sender: null,
    sid: null,
    sub: 'Welkom!',
    title: 'Welcome Message',
    type: 'email'
  },

  second: {
    aid: null,
    body: 'Hey {{= user.name || "there" }}, Welkom to Second CabanaLand!',
    creator: null,
    sender: null,
    sid: null,
    sub: 'Welkom Boss!',
    title: 'Welcome Message',
    type: 'notification'
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
  con.aid = aid;
  con.assignee = accid;
  con.uid = uid;
  Conversation.create(con, fn);
}


function createNotification(accid, aid, amId, uid, notf, fn) {

  notf.accid = accid;
  notf.aid = aid;
  notf.amId = amId;
  notf.uid = uid;
  Notification.create(notf, fn);

}



function createAutoMessage(accid, aid, sender, sid, automessage, fn) {

  automessage.creator = accid;
  automessage.aid = aid;
  automessage.sender = sender;
  automessage.sid = sid;

  AutoMessage.create(automessage, fn);
}


function createSegment(accid, aid, segment, fn) {

  segment.creator = accid;
  segment.aid = aid;

  Segment.create(segment, fn);
}


function createInvite(accid, aid, invite, cb) {

  invite.from = accid;
  invite.aid = aid;
  Invite.create(invite, cb);
}


function createUserNote(accid, aid, uid, note, cb) {

  note.aid = aid;
  note.creator = accid;
  note.uid = uid;
  UserNote.create(note, cb);
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

      // set the account id of the second message to first account _id
      newCon.messages[1].accid = accid;

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


    createFirstSegment: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var segment = segments.first;

      createSegment(accid, aid, segment, function (err, seg) {
        if (err) return cb(err);
        segments.first = seg;
        cb();
      });

    },


    createFirstAutoMessage: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var sender = accounts.second._id;
      var sid = segments.first._id;
      var automessage = automessages.first;

      createAutoMessage(accid, aid, sender, sid, automessage, function (err,
        amsg) {
        if (err) return cb(err);
        automessages.first = amsg;
        cb();
      });

    },


    createSecondAutoMessage: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var sender = accounts.second._id;
      var sid = segments.first._id;
      var automessage = automessages.second;

      createAutoMessage(accid, aid, sender, sid, automessage, function (err,
        amsg) {
        if (err) return cb(err);
        automessages.second = amsg;
        cb();
      });

    },


    createFirstNotification: function (cb) {

      var aid = apps.first._id;
      var amId = automessages.first._id;
      var accid = accounts.first._id;
      var uid = users.first._id;
      var notification = notifications.first;

      createNotification(accid, aid, amId, uid, notification, function (err,
        notf) {
        if (err) return cb(err);
        notifications.first = notf;
        cb();
      });

    },

    createFirstInvite: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var invite = invites.first;

      createInvite(accid, aid, invite, function (err, inv) {
        if (err) return cb(err);
        invites.first = inv;
        cb();
      });

    },

    createFirstUserNote: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var uid = users.first._id;
      var usernote = usernotes.first;

      createUserNote(accid, aid, uid, usernote, function (err, note) {
        if (err) return cb(err);
        usernotes.first = note;
        cb();
      });

    },




    createSecondUserNote: function (cb) {

      var aid = apps.first._id;
      var accid = accounts.first._id;
      var uid = users.first._id;
      var usernote = usernotes.second;

      createUserNote(accid, aid, uid, usernote, function (err, note) {
        if (err) return cb(err);
        usernotes.second = note;
        cb();
      });

    },

  }, function (err) {

    if (err) {
      logger.crit({
        at: 'test/fixtures/index.js',
        err: err
      });
    }

    var savedObj = {
      accounts: accounts,
      apps: apps,
      automessages: automessages,
      conversations: conversations,
      invites: invites,
      notifications: notifications,
      segments: segments,
      users: users,
      usernotes: usernotes
    };

    callback(err, savedObj);

  });
}
