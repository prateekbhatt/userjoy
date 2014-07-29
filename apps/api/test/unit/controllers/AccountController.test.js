describe('Resource /account', function () {

  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');


  /**
   * models
   */

  var Account = require('../../../api/models/Account');
  var App = require('../../../api/models/App');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId,

    randomEmail = 'randomEmail@example.com',

    newAccount = {

      name: 'Prats',
      email: 'prattbhatt+1@gmail.com',
      password: 'testingtesting'

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
    setupTestDb(done);
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
      loginUser(done);
    });

    it('fetches account with given id', function (done) {
      request
        .get('/account')
        .set('cookie', loginCookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          if (res.body.email !== saved.accounts.first.email) {
            return 'Could not fetch firstAccount';
          }
        })
        .end(done);

    });

    it('should not return password', function (done) {

      request
        .get('/account')
        .set('cookie', loginCookie)
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

    it('creates new account, creates default app and logs in user',
      function (done) {

        var newAccount = {

          name: 'Prats',
          email: 'prattbhatt+1@gmail.com',
          password: 'testingtesting'

        };

        request
          .post('/account')
          .send(newAccount)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            if (res.header['set-cookie'].length !== 1) {
              return 'header should contain with set-cookie array with one element';
            }

            expect(res.body)
              .to.have.property('message', 'Logged In Successfully');

            var acc = res.body.account;

            App.findByAccountId(acc._id, function (err, apps) {

              expect(err)
                .to.not.exist;

              expect(apps)
                .to.be.an('array')
                .and.have.length(1);

              var defaultApp = apps[0];

              expect(defaultApp)
                .to.have.property('name', 'YOUR COMPANY');


            })
          })
          .end(done);

      });

    it('returns error if duplicate email', function (done) {

      var existingEmailAccount = existingEmailAccount = {

        name: 'Pratt',
        email: saved.accounts.first.email,
        password: 'testingnewapprandom'

      }
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
          "error": ["Email is required"],
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
          "error": ["Password is required"],
          "status": 400
        })
        .end(done);

    });

    it('should return error if password is shorter than 8 characters',
      function (done) {

        var acc = {
          name: 'Pratt',
          email: 'prateek@example.com',
          password: '1234567'
        };

        request
          .post('/account')
          .send(acc)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": ["Password should be longer than 8 characters"],
            "status": 400
          })
          .end(done);

      });


    it('should return error if name is not provided',
      function (done) {

        var acc = {
          email: 'prateek@example.com',
          password: '12345678'
        };

        request
          .post('/account')
          .send(acc)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": ['name is required'],
            "status": 400
          })
          .end(done);

      });

    it('should return error if name is shorter than 2 characters',
      function (done) {

        var acc = {
          name: 'N',
          email: 'prateek@example.com',
          password: '12345678'
        };

        request
          .post('/account')
          .send(acc)
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            "error": ['Name should be longer than 2 characters'],
            "status": 400
          })
          .end(done);

      });

  });

  describe('POST /account/verify-email/resend', function () {

    var url = '/account/verify-email/resend';

    it('should return error if email not provided', function (done) {

      request
        .post(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Please provide your email'
        })
        .end(done);

    });

    it('should return error if account not found', function (done) {

      var randomEmail = 'randomEmail@randomEmail.com';

      request
        .post(url)
        .send({
          email: randomEmail
        })
        .expect('Content-Type', /json/)
        .expect(404)
        .expect({
          status: 404,
          error: 'Account not found'
        })
        .end(done);

    });

    it('should resend confirmation email', function (done) {

      var email = saved.accounts.second.email;

      request
        .post(url)
        .send({
          email: email
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          expect(res.body)
            .to.have.property('message')
            .that.is.a('string')
            .and.eqls('Verification email has been sent');
        })
        .end(done);

    });

  });


  describe('GET /account/:id/verify-email/:token', function () {

    it('returns error for wrong token', function (done) {

      var url = '/account/' +
        saved.accounts.first._id +
        '/verify-email/' +
        'randomToken';

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Invalid Attempt'
        })
        .end(done);

    });

    it('returns error for wrong accountId', function (done) {

      var url = '/account/' +
        randomId() +
        '/verify-email/' +
        saved.accounts.first.verifyToken;

      request
        .get(url)
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          status: 400,
          error: 'Invalid Attempt'
        })
        .end(done);

    });

    it('updates email verified status to true', function (done) {

      var acc = saved.accounts.second;

      expect(acc.emailVerified)
        .to.be.false;

      var url = '/account/' + acc._id + '/verify-email/' + acc.verifyToken;

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
      loginUser(done)
    });

    it('updates name', function (done) {

      request
        .put('/account/name')
        .set('cookie', loginCookie)
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


  describe('PUT /account/password/update', function () {

    var newPass = 'WowCoolPassword';
    var currPass;

    before(function (done) {
      currPass = saved.accounts.first.password;
      logoutUser(done);
    });

    it('should return unauthorized error if not logged in', function (done) {

      request
        .put('/account/password/update')
        .send({
          newPassword: newPass,
          currentPassword: currPass
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
      loginUser(done)
    });

    it('should return badRequest error if incorrect current password',
      function (done) {

        request
          .put('/account/password/update')
          .set('cookie', loginCookie)
          .send({
            newPassword: newPass,
            currentPassword: 'randomoldPass'
          })
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
            error: 'Please provide the correct current password'
          })
          .end(done);

      });

    it('should update password', function (done) {

      request
        .put('/account/password/update')
        .set('cookie', loginCookie)
        .send({
          newPassword: newPass,
          currentPassword: currPass
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
          message: 'Password updated'
        })
        .end(done);

    });

  });


  describe('PUT /account/forgot-password', function () {

    var spy;

    beforeEach(function () {
      spy = sinon.spy(Account, 'createResetPasswordToken');
    });


    afterEach(function () {
      Account.createResetPasswordToken.restore();
    });


    it('should return success message', function (done) {

      request
        .put('/account/forgot-password')
        .send({
          email: saved.accounts.first.email
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect({
          message: 'Reset password email sent'
        })
        .end(done);

    });

    it('should call Account#createResetPasswordToken', function (done) {

      request
        .put('/account/forgot-password')
        .send({
          email: saved.accounts.first.email
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          expect(spy)
            .to.have.been.calledOnce;
        })
        .end(done);

    });

    it('should return error if email is not provided', function (done) {

      request
        .put('/account/forgot-password')
        .expect('Content-Type', /json/)
        .expect(400)
        .expect({
          error: 'Provide a valid email',
          status: 400
        })
        .expect(function (res) {
          expect(spy)
            .to.have.been.calledOnce;
        })
        .end(done);

    });

    it('should return error if account with given email is not found',
      function (done) {

        request
          .put('/account/forgot-password')
          .send({
            email: randomEmail
          })
          .expect('Content-Type', /json/)
          .expect(404)
          .expect({
            error: 'Provide a valid email',
            status: 404
          })
          .expect(function (res) {
            expect(spy)
              .to.have.been.calledOnce;
          })
          .end(done);

      });


  });



  describe('PUT /account/forgot-password/new', function () {


    var token = 'thisismyrandomtoken';
    var newPass = 'helloworld';
    var url = '/account/forgot-password/new';


    it('should return error for invalid token', function (done) {

      async.series({

        createResetPasswordToken: function (cb) {

          Account
            .findById(saved.accounts.first._id)
            .exec(function (err, acc) {
              expect(err)
                .to.not.exist;

              acc.passwordResetToken = 'thisismyrandomtoken';
              acc.save(cb)
            })

        },

        errorOnInvalidToken: function (cb) {

          request
            .put(url)
            .send({
              token: 'randomTOKEN',
              password: newPass
            })
            .expect('Content-Type', /json/)
            .expect(400)
            .expect({
              status: 400,
              error: 'Invalid Attempt. Please try again.'
            })
            .end(cb);
        }


      }, done);


    });


    it('should delete passwordResetToken and return account',
      function (done) {

        var accountId;

        async.series({

          shouldReturnAccountInfo: function (cb) {

            request
              .put(url)
              .send({
                token: token,
                password: newPass
              })
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(function (res) {

                accountId = res.body.account._id;

                expect(res.body.account)
                  .to.be.an('object')
                  .that.not.has.property('password');

              })
              .end(cb);
          },


          deletedPasswordResetToken: function (cb) {

            Account
              .findById(accountId)
              .select('passwordResetToken')
              .exec(function (err, acc) {
                expect(err)
                  .to.not.exist;

                expect(acc.passwordResetToken)
                  .not.to.exist;

                cb()
              })

          }


        }, done)


      });

  });

});
