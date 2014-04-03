describe('Resource /track', function () {

  // define test variables
  var newSession = {
    'hello': 'world'
  };
  var newUser = {
    email: 'prattbhatt@gmail.com',
  };
  var randomId = '532d6bf862d673ba7131812a';



  before(function (done) {
    newSession = JSON.stringify(newSession);
    newUser = JSON.stringify(newUser);
    setupTestDb(done);
  });

  describe('GET /track', function () {

    before(function (done) {
      logoutUser(done);
    });

    it('should return error if there is no app_id', function (done) {

      var url = '/track';

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Please send app_id with the params'
        })
        .end(done);
    });

    it('should return error if there is no user object',
      function (done) {

        var url = '/track?' +
          'app_id=' +
          randomId;

        request
          .get(url)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should return error if user_id and email are missing',
      function (done) {

        var user = JSON.stringify({});

        var url = '/track?' +
          'app_id=' +
          randomId +
          '&user=' +
          user;

        request
          .get(url)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please send user_id or email to identify user'
          })
          .end(done);

      });

    it('should create user if user does not exist', function (done) {

        var url = '/track?' +
          'app_id=' +
          randomId +
          '&user=' +
          newUser;


      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });

    // it('should return error if no user object input',

    //   function (done) {

    //     request
    //       .get('/track?' + 'session=' + newSession)
    //       .expect('Content-Type', /json/)
    //       .expect(400)
    //       .expect({
    //         status: 400,
    //         error: 'Please call user.identify with user details'
    //       })
    //       .end(done);

    //   });

  });

});
