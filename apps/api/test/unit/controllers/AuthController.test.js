describe('Resource /auth', function () {

  var savedFirstAccount,

    firstAccount = {
      name: 'Prateek',
      email: 'prateek@dodatado.com',
      password: 'testingnewapp'
    };

  before(function (done) {

    request
      .post('/account')
      .send(firstAccount)
      .expect(201)
      .expect(function (res) {
        savedFirstAccount = res.body;
      })
      .end(done);

  });

  after(function (done) {
    dropTestDb(done);
  });

  describe('POST /auth/login', function () {

    it('authenticates user with correct credentials',
      function (done) {
        request
          .post('/auth/login')
          .send({
            email: firstAccount.email,
            password: firstAccount.password
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .expect({
            message: "Logged In Successfully"
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
            email: firstAccount.email,
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
      loginUser(firstAccount.email, firstAccount.password, done);
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
