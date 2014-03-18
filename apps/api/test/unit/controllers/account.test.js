describe('Resource /accounts', function () {

  var savedFirstAccount,

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
      .post('/accounts')
      .send(firstAccount)
      .expect(function (res) {
        savedFirstAccount = res.body;
      })
      .end(done);

  });

  describe('GET /accounts', function () {

    it('fetches all accounts',
      function (done) {

        request
          .get('/accounts')
          .expect('Content-Type', /json/)
          .expect(function (res) {
            if (!Array.isArray(res.body)) {
              return 'Should return an array';
            }
          })
          .expect(200)
          .end(done);

      });

  });

  describe('GET /accounts/:id', function () {

    it('fetches account with given id', function (done) {

      request
        .get('/accounts/' + savedFirstAccount._id)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          if (res.body.email !== firstAccount.email) {
            return 'Could not fetch firstAccount';
          }
        })
        .expect(200)
        .end(done);

    });

    it('should not return password', function (done) {

      request
        .get('/accounts/' + savedFirstAccount._id)
        .expect('Content-Type', /json/)
        .expect(function (res) {
          if (!!res.body.password) {
            return 'Returning password';
          }
        })
        .expect(200)
        .end(done);

    });

    it('returns error if no account with id is present',
      function (done) {

        var randomId = '5303570d9c554e7356000017';

        request
          .get('/accounts/' + randomId)
          .expect('Content-Type', /json/)
          .expect(404)
          .expect({
            "error": "Not Found",
            "status": 404
          })
          .end(done);

      });
  });

  describe('POST /accounts', function () {

    it('creates new account', function (done) {

      request
        .post('/accounts')
        .send(secondAccount)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(done);

    });

    it('returns error if duplicate email', function (done) {

      request
        .post('/accounts')
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
        .post('/accounts')
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
        .post('/accounts')
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

});
