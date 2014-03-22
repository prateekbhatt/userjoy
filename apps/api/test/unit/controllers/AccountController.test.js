describe('Resource /account', function () {

  var savedFirstAccount,

    randomObjectId = '5303570d9c554e7356000017',

    randomEmail = 'randomEmail@example.com',

    firstAccount = {

      name: 'Prateek',
      email: 'prateek@dodatado.com',
      password: 'testingnewapp'

    },

    secondAccount = {

      name: 'Savinay',
      email: 'savinay@dodatado.com',
      password: 'testingtesting'

    },

    existingEmailAccount = {

      name: 'Pratt',
      email: 'prateek@dodatado.com',
      password: 'testingnewapprandom'

    },

    accountWithoutEmail = {

      name: 'Pratt',
      password: 'testingnewapprandom'

    },

    accountWithoutPassword = {

      name: 'Pratt',
      email: 'pratt@dodatado.com'

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
    dropTestDb(done)
  });

  describe('GET /account', function () {

    it('returns unauthorized error if not logged in', function (done) {

      request
        .get('/account')
        .expect('Content-Type', /json/)
        .expect({
          status: 401,
          error: 'Unauthorized',
        })
        .expect(401)
        .end(done);

    });

    it('logging in user', function (done) {
      loginUser(firstAccount.email, firstAccount.password, done)
    });

    it('fetches account with given id', function (done) {
      request
        .get('/account')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          if (res.body.email !== firstAccount.email) {
            return 'Could not fetch firstAccount';
          }
        })
        .end(done);

    });

    it('should not return password', function (done) {

      request
        .get('/account')
        .expect('Content-Type', /json/)
        .expect(function (res) {
          if ( !! res.body.password) {
            return 'Returning password';
          }
        })
        .expect(200)
        .end(done);

    });

  });

  describe('POST /account', function () {

    it('creates new account', function (done) {

      request
        .post('/account')
        .send(secondAccount)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(done);

    });

    it('returns error if duplicate email', function (done) {

      request
        .post('/account')
        .send(existingEmailAccount)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          "error": "Email already exists",
          "status": 400
        })
        .end(done);

    });

    it('returns error if email is not provided', function (done) {

      request
        .post('/account')
        .send(accountWithoutEmail)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          "error": ["email is required"],
          "status": 400
        })
        .end(done);

    });

    it('returns error if password is not provided', function (done) {

      request
        .post('/account')
        .send(accountWithoutPassword)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          "error": ["password is required"],
          "status": 400
        })
        .end(done);

    });

  });

  describe('GET /account/:id/verify-email/:token', function () {

    it('returns error for wrong token', function (done) {

      var url = '/account/' +
        savedFirstAccount._id +
        '/verify-email/' +
        'randomToken';

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Invalid Attempt'
        })
        .end(done);

    });

    it('returns error for wrong accountId', function (done) {

      var url = '/account/' +
        randomObjectId +
        '/verify-email/' +
        savedFirstAccount.verifyToken;

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Invalid Attempt'
        })
        .end(done);

    });

    it('updates email verified status to true', function (done) {

      var url = '/account/' +
        savedFirstAccount._id +
        '/verify-email/' +
        savedFirstAccount.verifyToken;

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          if (!res.body.emailVerified === true) {
            return 'Email verification not working';
          }
        })
        .end(done);

    });

  });

  describe('PUT /account/name', function () {

    var newName = 'PrattBhatt';

    before(function (done) {
      logoutUser(done);
    });

    it('returns unauthorized error if not logged in', function (done) {

      request
        .put('/account/name')
        .send({
          name: newName
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Unauthorized'
        })
        .end(done);

    });

    it('logging in user', function (done) {
      loginUser(firstAccount.email, firstAccount.password, done)
    });

    it('updates name', function (done) {

      request
        .put('/account/name')
        .send({
          name: newName
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          if (res.body.name !== newName) {
            return 'Name was not updated';
          }
        })
        .end(done);

    });

  });



  describe('PUT /account/reset-password', function () {

    it('creates a reset password token', function (done) {

      request
        .put('/account/reset-password')
        .send({
          email: savedFirstAccount.email
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          if (!res.body.passwordResetToken) {
            return 'passwordResetToken was not created';
          }
        })
        .end(done);

    });

    it('returns error if email is not provided', function (done) {

      request
        .put('/account/reset-password')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          error: 'Provide a valid email',
          status: 400
        })
        .end(done);

    });

    it('returns error if account with given email is not found',
      function (done) {

        request
          .put('/account/reset-password')
          .send({
            email: randomEmail
          })
          .expect('Content-Type', /json/)
          .expect(404)
          .expect({
            error: 'Provide a valid email',
            status: 404
          })
          .end(done);

      });


  });

});
