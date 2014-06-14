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
          list: 'users',
          name: 'New segment',
          op: 'and',
          filters: [

            {
              method: 'count',
              name: 'Create Notification',
              type: 'track',
              op: 'eq',
              val: 0
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
              .to.have.property("aid", aid.toString());

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


  describe('PUT /apps/:aid/segments/:sid', function () {

    var aid, sid;
    var testSeg;
    var testUrl;

    before(function (done) {
      testSeg = saved.segments.first;
      sid = testSeg._id;
      aid = testSeg.aid;
      testUrl = '/apps/' + aid + '/segments/' + sid;
      logoutUser(done);
    });


    it('should return error if not logged in', function (done) {

      request
        .put(testUrl)
        .send({})
        .expect('Content-Type', /json/)
        .expect(401)
        .expect({
          status: 401,
          error: 'Unauthorized'
        })
        .end(done);

    });


    it('logging in user', function (done) {
      loginUser(done);
    });


    it('should update segment', function (done) {


      var updatedFilters = [

        {
          method: 'hasdone',
          name: 'Add User',
          type: 'track'
        }

      ];

      var updateSegment = {
        list: 'users',
        name: 'Updated Name',
        filters: updatedFilters,
        op: 'or',
        fromAgo: 10,
        toAgo: 5
      };

      request
        .put(testUrl)
        .set('cookie', loginCookie)
        .send(updateSegment)
        .expect('Content-Type', /json/)
        .expect(201)
        .expect(function (res) {

          expect(res.body)
            .to.be.an('object')
            .and.to.not.be.empty;

          expect(res.body)
            .to.have.property("filters")
            .that.is.an("array")
            .that.deep.equals(updatedFilters)
            .that.not.deep.equals(testSeg.filters);

          expect(res.body)
            .to.have.property("op")
            .that.is.an("string")
            .that.equals(updateSegment.op)
            .that.not.equals(testSeg.op);

          expect(res.body)
            .to.have.property("name")
            .that.is.an("string")
            .that.equals(updateSegment.name)
            .that.not.equals(testSeg.name);

          expect(res.body)
            .to.have.property("fromAgo")
            .that.is.an("number")
            .that.equals(updateSegment.fromAgo)
            .that.not.equals(testSeg.fromAgo);

          expect(res.body)
            .to.have.property("toAgo")
            .that.is.an("number")
            .that.equals(updateSegment.toAgo)
            .that.not.equals(testSeg.toAgo);

        })
        .end(done);

    });

  });

});
