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
      if (err) return done(err);
      aid = saved.apps.first._id;
      basePath = '/apps/' + aid + '/messages';
      done();
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


  describe('POST /apps/:aid/messages/:mId', function () {

    var parentMessageId;
    var testUrl;

    before(function (done) {
      parentMessageId = saved.messages.first._id;
      testUrl = basePath + '/' + parentMessageId;
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

    it('should return error if text/type is not provided',

      function (done) {

        var newMessage = {};
        // TODO: fix this test, and the validation method in the MessageController
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

    it('should create new message',

      function (done) {

        var newMessage = {
          text: 'This is the message I want to send'
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

  // TODO : create a message whose status is seen to clearly demostrate the
  // results of fetchAll from fetchInbox (seen == false)

  describe('GET /apps/:aid/messages/unread', function () {

    var testPath;

    before(function (done) {
      testPath = basePath + '/unread'
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

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


    it('should return all unseen messages belonging to app',

      function (done) {
        request
          .get(testPath)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {

            _.each(res.body, function (m) {
              expect(m.seen)
                .to.be.false;
            });

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

    var testMessage;

    before(function (done) {
      testMessage = saved.messages.first;
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(basePath + '/' + testMessage._id)
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
          .get(basePath + '/' + testMessage._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {

            expect(res.body)
              .to.be.an("array");

            expect(res.body)
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
            coId: testMessage.coId
          })
          .exec(function (err, msgs) {

            if (err) return done(err);

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


});
