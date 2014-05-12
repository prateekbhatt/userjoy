describe('Resource /apps/:aid/segments', function () {

  var randomId = '532d6bf862d673ba7131812a';
  var aid;
  var url;


  before(function (done) {
    setupTestDb(function (err) {
      if (err) return done(err);
      aid = saved.apps.first._id;
      url = '/apps/' + aid + '/segments';
      done();
    });
  });


  describe('POST /apps/:aid/segments', function () {

    var savedMsg;

    var newSegment = {};

    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .post(url)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('should create new segment',

      function (done) {

        var newSegment = {
          aid: randomId,
          list: 'users',
          name: 'New segment',
          op: 'and',
          filters: [

            {
              method: 'count',
              name: 'Create Notification',
              type: 'feature',
              val: 'hello'
            }

          ]
        };

        request
          .post(url)
          .set('cookie', loginCookie)
          .send(newSegment)
          .expect('Content-Type', /json/)
          .expect(201)
          .expect(function (res) {
            savedMsg = res.body;

            expect(savedMsg)
              .to.have.property("creator", newSegment.creator);

            expect(savedMsg)
              .to.have.property("aid", newSegment.aid.toString());

          })
          .end(done);

      });

  });


  describe('GET /apps/:aid/segments', function () {


    before(function (done) {
      logoutUser(done);
    });


    it('returns error if not logged in',

      function (done) {

        request
          .get(url)
          .send({})
          .expect('Content-Type', /json/)
          .expect(401)
          .expect({
            status: 401,
            error: 'Unauthorized'
          })
          .end(done);

      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('fetches all segments belonging to app',

      function (done) {

        request
          .get(url)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {

            expect(res.body)
              .to.be.an("array");

            expect(res.body)
              .to.not.be.empty;
          })
          .expect(200)
          .end(done);

      });

  });

  describe('GET /apps/:aid/segments/:sid', function () {

    var savedSegmentId;
    var testUrl;

    before(function (done) {
      logoutUser(function (err) {
        savedSegmentId = saved.segments.first._id;
        testUrl = url + '/' + savedSegmentId;
        done(err);
      });
    });


    it('returns error if not logged in',

      function (done) {

        request
          .get(testUrl)
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done);
      });


    it('logging in user',

      function (done) {
        loginUser(done);
      });


    it('fetches segment with given id',

      function (done) {

        request
          .get(testUrl)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(function (res) {
            expect(res.body)
              .to.not.be.empty;

            expect(res.body.filters)
              .to.be.an('array');

            expect(res.body.filters)
              .to.have.length(1);
          })
          .expect(200)
          .end(done);

      });


    it('returns error if no app with id is present',

      function (done) {

        var randomId = '5303570d9c554e7356000017';

        request
          .get('/apps/' + randomId)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .expect({
            "error": "Not Found",
            "status": 404
          })
          .end(done);

      });


    it('returns error if user doesnt have access to app',

      function (done) {

        request
          .get('/apps/' + saved.apps.second._id)
          .set('cookie', loginCookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done);

      });
  });


});
