describe('Resource /', function () {

  describe('GET /', function () {

    it('returns welcome message',
      function (done) {
        request
          .get('/')
          .expect('Content-Type', /json/)
          .expect({
            "message": "Welcome to DoDataDo API"
          })
          .expect(200, done);
      });

  });
});
