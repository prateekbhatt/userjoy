describe('Resource /auth', function () {

  /**
   * models
   */

  var Account = require('../../../api/models/Account');


  before(function (done) {
    setupTestDb(done);
  });


  describe('POST /auth/login', function () {

    it('returns error with incorrect email',
      function (done) {
        request
          .post('/auth/login')
          .send({
            email: 'randomemail',
            password: 'randomPass'
          })
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({
            status: 400,
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
          .expect(400)
          .expect({
            status: 400,
            error: "Invalid Email/Password"
          })
          .end(done);
      });

    it('should NOT return error if the email is not verified',
      function (done) {

        var acc = saved.accounts.second;

        expect(acc.emailVerified)
          .to.be.false;


        request
          .post('/auth/login')
          .send({
            email: acc.email,
            password: acc.password
          })
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(function (res) {
            if (res.header['set-cookie'].length !== 1) {
              return 'header should contain with set-cookie array with one element';
            }
          })
          .end(done);
      });


    it('authenticates user with correct credentials, if email is verified',
      function (done) {

        var acc = saved.accounts.first;


        async.series(

          [

            function verifyEmail(cb) {

              Account.findByIdAndUpdate(acc._id, {
                emailVerified: true
              }, cb);

            },


            function shouldAuthenticate(cb) {

              request
                .post('/auth/login')
                .send({
                  email: acc.email,
                  password: acc.password
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
                .end(cb);
            }

          ],

          done

        );

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
