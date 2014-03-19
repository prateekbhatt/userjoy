describe('Resource /auth', function () {

  var savedFirstAccount,

    firstAccount = {
      name: 'Prateek',
      email: 'prateek@dodatado.com',
      password: 'testingnewapp'
    };

  before(function (done) {

    request
      .post('/accounts')
      .send(firstAccount)
      .expect(function (res) {
        savedFirstAccount = res.body;
      })
      .end(done);

  });

  after(function (done) {
    dropTestDb(done);
  });

  describe('POST /auth/login', function () {

    it('authenticates user',
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
            status: 200,
            message: "Logged In Successfully"
          })
          .end(done);
      });

  });

  describe('POST /auth/logout', function () {

    it('login', function () {
      loginUser({
        email: firstAccount.email,
        password: firstAccount.password
      })
    });

    it('logs out user',
      function (done) {
        request
          .post('/auth/logout')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect({
            status: 200,
            message: "Logged Out Successfully"
          })
          .end(done);
      });

  });

});
