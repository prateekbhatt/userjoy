describe('Resource /apps/:aid/conversations', function () {

  /**
   * npm dependencies
   */

  var ObjectId = require('mongoose')
    .Types.ObjectId;


  /**
   * policies
   */

  var hasAccess = require('../../../api/policies/hasAccess');


  /**
   * models
   */

  var Conversation = require('../../../api/models/Conversation');
  var Message = require('../../../api/models/Message');


  var newConversation = {
    name: 'My New Conversation'
  },

    randocoId = '532d6bf862d673ba7131812a',

    aid,

    basePath;


  before(function (done) {
    setupTestDb(function (err) {
      if (err) return done(err);
      aid = saved.apps.first._id;
      basePath = '/apps/' + aid + '/conversations';
      done();
    });
  });


  describe('PUT /apps/:aid/conversations/:coId/closed', function () {

    var parentConversationId;
    var testUrl;

    before(function (done) {
      parentConversationId = saved.conversations.first._id;
      testUrl = basePath + '/' + parentConversationId + '/closed';
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .put(testUrl)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });

    it('should update conversation closed status to true',

      function (done) {

        request
          .put(testUrl)
          .set('cookie', loginCookie)
          .send(newConversation)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {
            expect(res.body.closed)
              .to.be.true;
          })
          .end(done);

      });

  });


  describe('PUT /apps/:aid/conversations/:coId/reopened', function () {

    var parentConversationId;
    var testUrl;

    before(function (done) {
      parentConversationId = saved.conversations.first._id;
      testUrl = basePath + '/' + parentConversationId + '/reopened';
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .put(testUrl)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });

    it('should update conversation closed status to false',

      function (done) {

        request
          .put(testUrl)
          .set('cookie', loginCookie)
          .send(newConversation)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {
            expect(res.body.closed)
              .to.be.false;
          })
          .end(done);

      });

  });


  describe('GET /apps/:aid/conversations', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(basePath)
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should return all open conversations belonging to app',

      function (done) {

        request
          .get(basePath)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.not.be.empty;

            expect(res.body[0].closed)
              .to.be.false;
          })
          .end(done);

      });


    it(
      'should return all closed conversations if query "?filter=closed"',
      function (done) {

        request
          .get(basePath + '?filter=closed')
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.not.be.empty;

            expect(res.body[0].closed)
              .to.be.true;
          })
          .end(done);

      });

  });


  describe('GET /apps/:aid/conversations/:coId', function () {

    var testCon;
    var testPath;

    before(function (done) {
      testCon = saved.conversations.first;
      testPath = basePath + '/' + testCon._id;
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .get(testPath)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Unauthorized'
        })
        .end(done);

    });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should return all messages belonging to message thread',

      // TODO: make sure atleast two messages are there in the thread

      function (done) {

        request
          .get(testPath)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("object");

            expect(res.body.messages)
              .to.be.an("array");

            expect(res.body.messages)
              .to.have.length.above(0);

            done();
          });

      });


    // this test depends on the output of the previous test, hence it should be
    // below
    it(
      'should update seen status to true for all messages, in the thread, sent from user',
      function (done) {

        Message
          .find({
            coId: testCon._id
          })
          .exec(function (err, msgs) {

            if (err) return done(err);

            expect(msgs)
              .to.have.length.above(0);

            _.chain(msgs)
              .each(function (m) {
                if (m.from === 'user') {
                  expect(m.seen)
                    .to.be.true;
                }
              })
              .value();

            done();
          });

      });

  });


  describe('POST /apps/:aid/conversations', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .post(basePath)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });

    it('should return error if uid/sub/text/type is not provided',

      function (done) {

        var newMessage = {};
        // TODO: fix this test, and the validation method in the ConversationController
        request
          .post(basePath)
          .set('cookie', loginCookie)
          .send(newMessage)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Missing uid/sub/text/type'
          })
          .end(done);

      });

    it('should create new message',

      function (done) {
        var uid = saved.users.first._id;
        var newMessage = {
          sName: 'Prateek Bhatt',
          sub: 'Welcome to UserJoy!',
          text: 'This is the message I want to send',
          type: 'email',
          uid: uid,
        };

        request
          .post(basePath)
          .set('cookie', loginCookie)
          .send(newMessage)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            expect(res.body.text)
              .to.eql(newMessage.text);
          })
          .end(done);

      });

  });

  describe('POST /apps/:aid/conversations/:coId', function () {

    var savedCon;
    var testUrl;

    before(function (done) {
      savedCon = saved.conversations.first;
      testUrl = basePath + '/' + savedCon._id;
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .post(testUrl)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });

    it('should return error if text is not provided',

      function (done) {

        var newMessage = {};
        // TODO: fix this test, and the validation method in the ConversationController
        request
          .post(testUrl)
          .set('cookie', loginCookie)
          .send(newMessage)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Missing text'
          })
          .end(done);

      });

    it('should create new message reply',

      function (done) {

        var newMessage = {
          text: 'This is the message I want to reply'
        };

        request
          .post(testUrl)
          .set('cookie', loginCookie)
          .send(newMessage)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            expect(res.body.text)
              .to.eql(newMessage.text);
            expect(res.body.sName)
              .to.exist;
          })
          .end(done);

      });

  });

});
