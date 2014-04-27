describe('Resource /apps/:aid/messages', function () {


  /**
   * policies
   */

  var hasAccess = require('../../../api/policies/hasAccess');


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


  // describe('POST /messages', function () {


  //   before(function (done) {
  //     logoutUser(done);
  //   });


  //   it('returns error if not logged in',

  //     function (done) {

  //       request
  //         .post('/messages')
  //         .send(newMessage)
  //         .expect('Content-Type', /json/)
  //         .expect(401)
  //         .expect({
  //           status: 401,
  //           error: 'Unauthorized'
  //         })
  //         .end(done);

  //     });


  //   it('logging in user',

  //     function (done) {
  //       loginUser(done);
  //     });

  //   it('should return error if name is not present', function (done) {

  //     var newMessage = {
  //       domain: 'dodatado.com'
  //     };

  //     request
  //       .post('/messages')
  //       .set('cookie', loginCookie)
  //       .send(newMessage)
  //       .expect('Content-Type', /json/)
  //       .expect(400)
  //       .expect({
  //         "error": [
  //           "name is required"
  //         ],
  //         "status": 400
  //       })
  //       .end(done);

  //   });

  //   it('should return error if domain is not present', function (done) {

  //     var newMessage = {
  //       name: 'my-new-app'
  //     };

  //     request
  //       .post('/messages')
  //       .set('cookie', loginCookie)
  //       .send(newMessage)
  //       .expect('Content-Type', /json/)
  //       .expect(400)
  //       .expect({
  //         "error": [
  //           "domain is required"
  //         ],
  //         "status": 400
  //       })
  //       .end(done);

  //   });

  //   it('should create new app',

  //     function (done) {

  //       var newMessage = {
  //         name: 'new-app',
  //         domain: 'new-app.co'
  //       };

  //       request
  //         .post('/messages')
  //         .set('cookie', loginCookie)
  //         .send(newMessage)
  //         .expect('Content-Type', /json/)
  //         .expect(201)
  //         .expect(function (res) {
  //           if (res.body.name !== newMessage.name) {
  //             return 'Saved app\'s name does not match';
  //           }
  //         })
  //         .end(done);

  //     });

  // });


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
            if (!res.body.length) {
              return 'Should have returned to two messages';
            }
          })
          .expect(200)
          .end(done);

      });


    // TODO: write test to check if user has access to the app
    // it('should check if user hasAccess to the app',

    //   function (done) {

    //     var spy = sinon.spy(hasAccess);

    //     request
    //       .get(basePath)
    //       .set('cookie', loginCookie)
    //       .expect('Content-Type', /json/)
    //       .expect(function (res) {

    //         console.log('checking spy');
    //         expect(spy)
    //           .to.have.been.calledOnce;

    //       })
    //       .expect(200)
    //       .end(function (err) {
    //         done(err);
    //       });

    //   });

  });

  describe('GET /apps/:aid/messages/unseen', function () {

    var unseenPath;

    before(function (done) {
      unseenPath = basePath + '/unseen';
      logoutUser(done);
    });


    it('should return error if not logged in',

      function (done) {

        request
          .get(unseenPath)
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
          .get(unseenPath)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {

            if (!Array.isArray(res.body)) {
              return 'Should return an array';
            }

            var seenMsgs = _.filter(res.body, 'seen');

            expect(seenMsgs)
              .to.be.empty;

          })
          .expect(200)
          .end(done);

      });


  });

});
