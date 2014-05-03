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


});
