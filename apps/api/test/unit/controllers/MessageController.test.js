describe('Resource /apps/:aid/messages', function () {

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

  var Message = require('../../../api/models/Message');


  var newMessage = {
    name: 'My New Message'
  },

    randomId = '532d6bf862d673ba7131812a',

    aid,

    basePath;


  before(function (done) {
    setupTestDb(function (err) {
      if (!err) {
        aid = saved.apps.first._id;
        basePath = '/apps/' + aid + '/messages';
      }
      done(err);
    });
  });


  describe('POST /apps/:aid/messages', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .post(basePath)
          .send(newMessage)
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
        // TODO: fix this test, and the validation method in the MessageController
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

        var newMessage = {
          sName: 'Prateek Bhatt',
          sub: 'Welcome to UserJoy!',
          text: 'This is the message I want to send',
          type: 'email',
          uid: ObjectId(),
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


  describe('GET /apps/:aid/messages', function () {


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


    it('should return all messages belonging to app',

      function (done) {

        request
          .get(basePath)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {

            if (!Array.isArray(res.body)) {
              return 'Should return an array';
            }
            if (res.body.length !== 2) {
              return 'Should have returned to two messages';
            }
          })
          .end(done);

      });

  });

  describe('GET /apps/:aid/messages/:mId', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(basePath + '/' + saved.messages.first._id)
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
          .get(basePath + '/' + saved.messages.first._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            if (!Array.isArray(res.body)) {
              return 'Should return an array';
            }
            if (!res.body.length) {
              return 'Should have returned to two messages';
            }
          })
          .expect(200)
          .end(done);

      });

  });


});
