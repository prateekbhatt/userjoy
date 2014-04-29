describe('Model Message', function () {

  // TODO
  // Write test to check that if the message is created by a 'account', then
  // the accid is required


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
        mId: randomId,
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

        expect(msg.mId.toString())
          .to.eql(newMessage.mId);

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


    it('should add clicked/replied/seen/sent values as false', function () {

      expect(savedMessage.clicked)
        .to.eql(false);

      expect(savedMessage.replied)
        .to.eql(false);

      expect(savedMessage.seen)
        .to.eql(false);

      expect(savedMessage.sent)
        .to.eql(false);

    });

  });


  describe('#fetchInbox', function () {

    var aid = '532d6bf862d673ba7131812d';
    var fetchedMessage = {};

    before(function (done) {

      var newMessage = {
        accid: randomId,
        aid: aid,
        coId: randomId,
        from: 'user',
        sName: 'Prateek Bhatt',
        sub: 'New subject',
        text: 'Hello World',
        type: 'email',
        uid: randomId,
      };

      Message.create(newMessage, done);

    });

    it('should return messages belonging to an app', function (done) {

      Message.fetchInbox(aid, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an("array");

        fetchedMessage = msg[0];

        expect(msg)
          .to.have.length(1);

        expect(msg[0].text)
          .to.eql('Hello World');

        done();

      });
    });

    it('should return ct/replied/seen/sName/text',
      function () {

        expect(fetchedMessage)
          .to.not.have.property("aid");

        expect(fetchedMessage)
          .to.have.property("ct");

        expect(fetchedMessage)
          .to.have.property("replied");

        expect(fetchedMessage)
          .to.have.property("seen");

        expect(fetchedMessage)
          .to.have.property("sName");

        expect(fetchedMessage)
          .to.have.property("text");

      });

  });


  describe('#fetchThread', function () {

    var aid;
    var parentMessageId;
    var replyingAccount;
    var fetchedMessage = {};
    var currentMessageId;

    before(function (done) {
      aid = saved.apps.first._id;
      parentMessageId = saved.messages.first._id;
      replyingAccount = saved.accounts.first._id;


      var replyMessage = {
        accid: replyingAccount,
        aid: aid,
        coId: saved.messages.first.coId,
        from: 'account',
        mId: parentMessageId,
        sName: 'Random Name',
        sub: 'New subject',
        text: 'This is a reply from admin',
        type: 'email',
        uid: randomId,
      };

      Message.create(replyMessage, function (err, msg) {
        if (err) return done(err);
        currentMessageId = msg._id;
        done();
      });

    });

    it('should return messages belonging to a thread', function (done) {

      Message.fetchThread(aid, currentMessageId, function (err, msgs) {

        expect(err)
          .to.not.exist;

        expect(msgs)
          .to.be.an("array");

        fetchedMessage = msgs[2];

        expect(msgs)
          .to.have.length(3);

        expect(msgs[0].text)
          .to.eql('Hello World');

        expect(msgs[2].text)
          .to.eql('This is a reply from admin');


        var uniqConvIds = _.chain(msgs)
          .pluck('coIds')
          .uniq()
          .value();

        expect(uniqConvIds)
          .to.have.length(1);

        done();

      });
    });

    it('should return aid/coId/ct/name/replied/seen/text', function () {

      expect(fetchedMessage)
        .to.have.property("aid");

      expect(fetchedMessage)
        .to.have.property("coId");

      expect(fetchedMessage)
        .to.have.property("ct");

      expect(fetchedMessage)
        .to.have.property("replied");

      expect(fetchedMessage)
        .to.have.property("seen");

      expect(fetchedMessage)
        .to.have.property("sName");

      expect(fetchedMessage)
        .to.have.property("text");

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


  describe('#replied', function () {

    it('should update replied status to true', function (done) {

      var msg = saved.messages.first;

      expect(msg.replied)
        .to.be.false;

      Message.replied(msg._id, function (err, updatedMsg) {

        expect(err)
          .to.not.exist;

        expect(updatedMsg._id)
          .to.eql(msg._id);

        expect(updatedMsg.replied)
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

});
