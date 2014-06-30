describe('Model Conversation', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * Models
   */

  var Conversation = require('../../../api/models/Conversation');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;
  var savedConversation;


  before(function (done) {
    setupTestDb(done);
  });

  describe('#create', function () {

    it('should return error if aid/sub/uid is not provided',
      function (done) {

        var newCon = {};

        Conversation.create(newCon, function (err, con) {

          expect(err)
            .to.exist;

          expect(err.errors)
            .to.be.an('object')
            .and.to.have.keys(['uid', 'aid', 'sub']);

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.sub.message)
            .to.eql('Provide subject');

          expect(con)
            .to.not.exist;

          done();
        })

      });


    it('should return error if no messages are provided',
      function (done) {

        var newCon = {
          aid: randomId(),
          sub: 'Random Subject',
          uid: randomId(),
        };

        Conversation.create(newCon, function (err, con) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql('Conversation must have atleast one message');

          expect(con)
            .to.not.exist;

          done();
        })

      });


    it(
      'should return error if message body/from/type not provided or invalid',
      function (done) {

        var newCon = {
          aid: randomId(),
          messages: [{}],
          sub: 'Random Subject',
          uid: randomId(),
        };


        Conversation.create(newCon, function (err, con) {

          expect(err)
            .to.exist;

          expect(err.errors)
            .to.be.an('object')
            .and.to.have.keys(['messages.0.type', 'messages.0.from',
              'messages.0.body'
            ]);

          expect(err.errors['messages.0.type'].message)
            .to.eql('Provide message type');

          expect(err.errors['messages.0.from'].message)
            .to.eql('Provide valid from type, either user/account');

          expect(err.errors['messages.0.body'].message)
            .to.eql('Provide message body');

          done();

        });

      });


    it('should create conversation', function (done) {

      var newConversation = {
        aid: randomId(),
        assignee: randomId(),
        messages: [{
          body: 'Hello World',
          from: 'user',
          type: 'email'
        }],
        sub: 'My new subject',
        uid: randomId()
      };

      Conversation.create(newConversation, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con)
          .to.be.an('object');

        savedConversation = con;

        expect(con)
          .to.have.property("aid", newConversation.aid);

        expect(con)
          .to.have.property("assignee", newConversation.assignee);

        expect(con)
          .to.have.property("sub", newConversation.sub);

        expect(con)
          .to.have.property("uid", newConversation.uid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedConversation)
        .to.have.property('ct')
        .that.is.a("date");

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedConversation)
        .to.have.property('ut')
        .that.is.a("date");

    });


    it('should add closed value as false', function () {

      expect(savedConversation)
        .to.have.property('closed', false)
        .that.is.a("boolean");

    });


    it('should add default toRead value as false', function () {

      expect(savedConversation)
        .to.have.property('toRead', false)
        .that.is.a("boolean");

    });


    it('should store amId if provided', function (done) {

      var newConversation = {
        aid: randomId(),
        amId: randomId(),
        assignee: randomId(),
        messages: [{
          body: 'Hello World',
          from: 'user',
          type: 'email'
        }],
        sub: 'My new subject',
        uid: randomId()
      };

      Conversation.create(newConversation, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con)
          .to.be.an('object');

        savedConversation = con;

        expect(con)
          .to.have.property("aid", newConversation.aid);

        expect(con)
          .to.have.property("amId", newConversation.amId);

        expect(con)
          .to.have.property("assignee", newConversation.assignee);

        expect(con)
          .to.have.property("sub", newConversation.sub);

        expect(con)
          .to.have.property("uid", newConversation.uid);

        done();
      });

    });

  });


  describe('#closed', function () {


    it('should update closed status of conversation to true',
      function (done) {

        var savedCon = saved.conversations.first;

        expect(savedCon.closed)
          .to.be.false;

        Conversation.closed(savedCon._id, function (err, con) {

          expect(err)
            .to.not.exist;

          expect(con.closed)
            .to.be.true;

          done();

        });

      });

  });


  describe('#reopened', function () {

    var savedCon;

    before(function (done) {
      savedCon = saved.conversations.first;
      Conversation.closed(savedCon._id, function (err, con) {
        savedCon = con;
        done(err);
      });
    });

    it('should reopen closed conversation',
      function (done) {

        expect(savedCon.closed)
          .to.be.true;

        Conversation.reopened(savedCon._id, function (err, con) {

          expect(err)
            .to.not.exist;

          expect(con.closed)
            .to.be.false;

          done();

        });

      });

  });


  describe('#toBeRead', function () {

    var savedCon;

    before(function (done) {
      savedCon = saved.conversations.first;
      done();
    });


    it('should mark conversation as to be read', function (done) {

      expect(savedCon.toRead)
        .to.be.false;

      Conversation.toBeRead(savedCon._id, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con.toRead)
          .to.be.true;

        done();

      });

    });

  });


  describe('#isRead', function () {

    var savedCon;

    before(function (done) {
      savedCon = saved.conversations.first;
      Conversation.toBeRead(savedCon._id, function (err, con) {
        savedCon = con;
        done(err);
      });
    });


    it('should mark conversation as toRead', function (done) {

      expect(savedCon.toRead)
        .to.be.true;

      Conversation.isRead(savedCon._id, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con.toRead)
          .to.be.false;

        done();

      });

    });

  });


  describe('#reply', function () {

    it('should return error if reply body not provided', function (done) {

      var savedCon = saved.conversations.first;
      var reply = {};
      var coId = savedCon._id;
      var aid = savedCon.aid;


      Conversation.reply(aid, coId, reply, function (err, con) {

        expect(err)
          .to.exist
          .and.have.property('message', 'Provide message body');

        done();

      });

    });


    it('should return error if account from type is not provided',
      function (done) {

        var savedCon = saved.conversations.first;
        var reply = {
          body: 'Heya',
          from: 'randomness'
        };
        var coId = savedCon._id;
        var aid = savedCon.aid;


        Conversation.reply(aid, coId, reply, function (err, con) {

          expect(err)
            .to.exist
            .and.have.property('message',
              'Provide valid from type, either user/account');

          done();

        });

      });


    it('should return error if reply type is not provided', function (done) {

      var savedCon = saved.conversations.first;
      var reply = {
        body: 'Heya',
        from: 'account'
      };
      var coId = savedCon._id;
      var aid = savedCon.aid;


      Conversation.reply(aid, coId, reply, function (err, con) {

        expect(err)
          .to.exist
          .and.have.property('message', 'Provide message type');

        done();

      });

    });

    it('should create a reply to a conversation', function (done) {

      var savedCon = saved.conversations.first;
      var reply = {
        body: 'Heya',
        from: 'account',
        type: 'email'
      };
      var coId = savedCon._id;
      var aid = savedCon.aid;


      Conversation.reply(aid, coId, reply, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con.messages)
          .to.be.an('array')
          .that.has.length(3);

        var msg = con.messages[2];

        expect(msg)
          .to.be.an('object');

        expect(msg.body)
          .to.eql(reply.body);

        expect(msg.from)
          .to.eql(reply.from);

        expect(msg.type)
          .to.eql(reply.type);

        expect(msg.clicked)
          .to.be.false;

        expect(msg.seen)
          .to.be.false;

        expect(msg.sent)
          .to.be.false;

        expect(msg.ct)
          .to.be.a('date');

        expect(msg._id)
          .to.not.be.empty;

        done();

      });


    });

  });

  describe('#clicked', function () {

    it('should update clicked status to true', function (done) {

      var con = saved.conversations.first;
      var msg = con.messages[0];

      expect(msg.clicked)
        .to.be.false;

      Conversation.clicked(msg._id, function (err, numberAffected) {

        expect(err)
          .to.not.exist;

        expect(numberAffected)
          .to.eql(1);

        Conversation.findById(con._id, function (err, con) {

          var updatedMsg = con.messages[0];

          expect(updatedMsg._id)
            .to.eql(msg._id);

          expect(updatedMsg.clicked)
            .to.be.true;

          done();
        })


      })
    });

    it('should return error if message not found', function (done) {

      Conversation.clicked(randomId(), function (err, numberAffected) {

        expect(err)
          .to.exist;

        expect(err)
          .to.eql(
            'Message, for which status-update request was made, was not found'
        );

        expect(numberAffected)
          .to.not.exist;

        done();
      })
    });
  });


  describe('#sent', function () {

    it('should update sent status to true', function (done) {

      var con = saved.conversations.first;
      var msg = con.messages[0];

      expect(msg.sent)
        .to.be.false;

      Conversation.sent(msg._id, function (err, numberAffected) {

        expect(err)
          .to.not.exist;

        expect(numberAffected)
          .to.eql(1);

        Conversation.findById(con._id, function (err, con) {

          var updatedMsg = con.messages[0];

          expect(updatedMsg._id)
            .to.eql(msg._id);

          expect(updatedMsg.sent)
            .to.be.true;

          done();
        })


      })
    });

    it('should return error if message not found', function (done) {

      Conversation.sent(randomId(), function (err, numberAffected) {

        expect(err)
          .to.exist;

        expect(err)
          .to.eql(
            'Message, for which status-update request was made, was not found'
        );

        expect(numberAffected)
          .to.not.exist;

        done();
      })
    });
  });


  describe('#opened', function () {

    it('should update seen status to true', function (done) {

      var con = saved.conversations.first;
      var msg = con.messages[0];

      expect(msg.seen)
        .to.be.false;

      Conversation.opened(msg._id, function (err, numberAffected) {

        expect(err)
          .to.not.exist;

        expect(numberAffected)
          .to.eql(1);

        Conversation.findById(con._id, function (err, con) {

          var updatedMsg = con.messages[0];

          expect(updatedMsg._id)
            .to.eql(msg._id);

          expect(updatedMsg.seen)
            .to.be.true;

          done();
        })


      })
    });

    it('should return error if message not found', function (done) {

      Conversation.opened(randomId(), function (err, numberAffected) {

        expect(err)
          .to.exist;

        expect(err)
          .to.eql(
            'Message, for which status-update request was made, was not found'
        );

        expect(numberAffected)
          .to.not.exist;

        done();
      })
    });
  });


  describe('#openedByTeamMember', function () {

    var createCon;

    before(function (done) {

      createCon = {
        aid: randomId(),
        messages: [

          {
            body: 'Hello World',
            from: 'user',
            type: 'email'
          },

          {
            body: 'Hello World 2',
            from: 'account',
            type: 'email'
          },

          {
            body: 'Hello World 3',
            from: 'user',
            type: 'email'
          }

        ],
        sub: 'First Conversation!',
        uid: randomId()
      }


      Conversation
        .create(createCon, function (err, saved) {
          if (err) return done(err);
          createCon = saved;
          done();
        });


    });

    it('should update seen status of all messages from user to true',
      function (done) {


        // status for all messages should be false
        _.each(createCon.messages, function (m) {
          expect(m.seen)
            .to.be.false;
        });


        // status for all messages should be false
        Conversation
          .openedByTeamMember(createCon._id, function (err) {

            expect(createCon.messages)
              .to.be.an('array')
              .that.has.length(3);

            expect(err)
              .to.not.exist;

            Conversation.findById(createCon._id, function (err, con) {

              _.each(con.messages, function (m) {

                if (m.from === 'user') {
                  expect(m.seen)
                    .to.be.true;
                } else {
                  expect(m.seen)
                    .to.be.false;
                }

              });

              done()
            })

          })

      });
  });

});
