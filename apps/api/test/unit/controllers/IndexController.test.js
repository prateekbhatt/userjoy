describe('Resource /', function () {

  describe('GET /', function () {

    it('returns welcome message',
      function (done) {
        request
          .get('/')
          .expect('Content-Type', /json/)
          .expect({
            "message": "Welcome to the UserJoy API. Check out the documentation at: docs.userjoy.co"
          })
          .expect(200, done);
      });

  });
});
