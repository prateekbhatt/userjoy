describe('Model Message', function () {

  // TODO
  // Write test to check that if the message is created by a 'account', then
  // the accid is required


  /**
   * npm dependencies
   */

  var ObjectId = require('mongoose')
    .Types.ObjectId;


  /**
   * Models
   */

  var Message = require('../../../api/models/Message');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedMessage;


  before(function (done) {
    setupTestDb(done)
  });


  describe('#create', function () {

    it(
      'should return error if aid/coId/from/sub/text/type/uid is not provided',
      function (done) {

        var newCon = {};

        Message.create(newCon, function (err, msg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(7);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.coId.message)
            .to.eql('Invalid conversation id');

          expect(err.errors.from.message)
            .to.eql('Provide valid from type, either user/account');

          expect(err.errors.sub.message)
            .to.eql('Provide subject');

          expect(err.errors.text.message)
            .to.eql('Provide message text');

          expect(err.errors.type.message)
            .to.eql('Provide message type');

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(msg)
            .to.not.exist;

          done();
        })

      });


    it('should create message', function (done) {

      var newMessage = {
        accid: randomId,
        aid: randomId,
        coId: randomId,
        from: 'user',
        text: 'Hello World',
        type: 'email',
        sName: 'Prateek Bhatt',
        sub: 'Subject I Am',
        uid: randomId,
      };

      Message.create(newMessage, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an('object');

        savedMessage = msg;

        expect(msg.aid.toString())
          .to.eql(newMessage.aid);

        expect(msg.text)
          .to.eql(newMessage.text);

        expect(msg.sub)
          .to.eql(newMessage.sub);

        expect(msg.uid.toString())
          .to.eql(newMessage.uid);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedMessage)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedMessage)
        .to.have.property('ut');

    });


    it('should add clicked/seen/sent values as false', function () {

      expect(savedMessage.clicked)
        .to.eql(false);

      expect(savedMessage.seen)
        .to.eql(false);

      expect(savedMessage.sent)
        .to.eql(false);

    });

  });


  describe('#clicked', function () {

    it('should update clicked status to true', function (done) {

      var msg = saved.messages.first;

      expect(msg.clicked)
        .to.be.false;

      Message.clicked(msg._id, function (err, updatedMsg) {

        expect(err)
          .to.not.exist;

        expect(updatedMsg._id)
          .to.eql(msg._id);

        expect(updatedMsg.clicked)
          .to.be.true;

        done();
      })
    });

    it('should return error if message not found', function (done) {

      var randomMessageId = ObjectId();

      Message.clicked(randomMessageId, function (err, updatedMsg) {

        expect(err)
          .to.exist;

        expect(err)
          .to.eql(
            'Message, for which status-update request was made, was not found'
        );

        expect(updatedMsg)
          .to.not.exist;

        done();
      })
    });
  });


  describe('#opened', function () {

    it('should update seen status to true', function (done) {

      var msg = saved.messages.first;

      expect(msg.seen)
        .to.be.false;

      Message.opened(msg._id, function (err, updatedMsg) {

        expect(err)
          .to.not.exist;

        expect(updatedMsg._id)
          .to.eql(msg._id);

        expect(updatedMsg.seen)
          .to.be.true;

        done();
      })
    });
  });


  describe('#sent', function () {

    it('should update sent status to true', function (done) {

      var msg = saved.messages.first;

      expect(msg.sent)
        .to.be.false;

      Message.sent(msg._id, function (err, updatedMsg) {

        expect(err)
          .to.not.exist;

        expect(updatedMsg._id)
          .to.eql(msg._id);

        expect(updatedMsg.sent)
          .to.be.true;

        done();
      })
    });
  });

  describe('#openedByTeamMember', function () {

    var mIds = [];

    before(function (done) {

      var savedMsg = saved.messages.first;
      mIds = _.pluck(saved.messages, '_id');


      var adminReply = {
        accid: savedMsg.accid,
        aid: savedMsg.aid,
        coId: savedMsg.coId,
        from: 'account',
        sName: 'Prateek Sender',
        sub: savedMsg.sub,
        text: 'This is a new reply',
        type: 'email',
        uid: savedMsg.uid
      };


      Message
        .create(adminReply, function (err, newReply) {
          mIds.push(newReply._id);
          done();
        });


    });

    it('should update seen status of all messages from user to true',
      function (done) {

        Message
          .openedByTeamMember(mIds, function (err, numberAffected) {

            expect(mIds)
              .to.have.length(3);

            expect(err)
              .to.not.exist;

            expect(numberAffected)
              .to.eql(2);

            done()
          })

      });
  });

});
