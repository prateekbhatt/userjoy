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

});
