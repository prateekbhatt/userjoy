describe('Resource /auth', function () {

  before(function (done) {
    setupTestDb(done);
  });


  describe('POST /auth/login', function () {

    it('authenticates user with correct credentials',
      function (done) {
        request
          .post('/auth/login')
          .send({
            email: saved.accounts.first.email,
            password: saved.accounts.first.password
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .expect({
            message: "Logged In Successfully"
          })
          .expect(function (res) {
            if (res.header['set-cookie'].length !== 1) {
              return 'header should contain with set-cookie array with one element';
            }
          })
          .end(done);
      });

    it('returns error with incorrect email',
      function (done) {
        request
          .post('/auth/login')
          .send({
            email: 'randomemail',
            password: 'randomPass'
          })
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: "Invalid Email/Password"
          })
          .end(done);
      });

    it('returns error with incorrect password',
      function (done) {
        request
          .post('/auth/login')
          .send({
            email: saved.accounts.first.email,
            password: 'randomPass'
          })
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: "Invalid Email/Password"
          })
          .end(done);
      });

  });

  describe('POST /auth/logout', function () {

    it('logging in', function (done) {
      loginUser(done);
    });

    it('logs out user', function (done) {
      request
        .post('/auth/logout')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
          message: "Logged Out Successfully"
        })
        .end(done);
    });

  });

});
