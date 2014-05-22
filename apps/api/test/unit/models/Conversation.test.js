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


    it('should create conversation', function (done) {

      var newConversation = {
        aid: randomId(),
        accId: randomId(),
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
          .to.have.property("accId", newConversation.accId);

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


  describe('#assign', function () {

    it('should assign a team member to the conversation', function (done) {

      var savedCon = saved.conversations.first;
      var assignee = randomId();
      var coId = savedCon._id;
      var aid = savedCon.aid;


      Conversation.assign(aid, coId, assignee, function (err, con) {

        expect(err)
          .to.not.exist;

        expect(con.accId.toString())
          .to.eql(assignee.toString())
          .to.not.eql(savedCon.accId.toString());

        expect(con.aid.toString())
          .to.eql(aid.toString());

        expect(con._id.toString())
          .to.eql(coId.toString());

        done();

      });


    });

  });

});
