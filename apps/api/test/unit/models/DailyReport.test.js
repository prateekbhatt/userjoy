describe('Model DailyReport', function () {


  /**
   * npm dependencies
   */

  var mongoose = require('mongoose');
  var moment = require('moment');


  /**
   * Models
   */

  var DailyReport = require('../../../api/models/DailyReport');

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done);
  });


  describe.only('#preallocate', function () {

    var aid, uid, cid;
    var time = moment();
    var year = time.year();
    var month = time.month();


    before(function () {
      aid = saved.users.first.aid;
      uid = saved.users.first._id;
    });

    it('should create new document if it does not exist', function (done) {

      async.series([

        function beforeCheck(cb) {
          DailyReport.count({}, function (err, count) {

            expect(err)
              .to.not.exist;

            expect(count)
              .to.equal(0);

            cb();
          });
        },


        function newDocument(cb) {

          DailyReport.preallocate(aid, uid, cid, year, month,
            function (err, numberAffected, res) {

              expect(err)
                .to.not.exist;

              expect(numberAffected)
                .to.eql(1);

              expect(res)
                .to.be.an("object")
                .that.has.keys(['n', 'ok', 'updatedExisting',
                  'upserted'
                ]);

              expect(res.n)
                .to.eql(1);

              expect(res.ok)
                .to.be.true;

              expect(res.updatedExisting)
                .to.be.false;

              expect(res.upserted)
                .to.be.an("array");

              cb(err);
            });
        },

        function afterCheck(cb) {

          DailyReport.find({}, function (err, reports) {

            expect(err)
              .to.not.exist;

            expect(reports.length)
              .to.eql(1);

            cb();
          });

        }

      ], done)


    });


    it('should not create new document if it exists', function (done) {

      async.series([

        function beforeCheck(cb) {
          DailyReport.find({}, function (err, reports) {

            expect(err)
              .to.not.exist;

            expect(reports.length)
              .to.equal(1);

            cb();
          });
        },


        function newDocument(cb) {

          DailyReport.preallocate(aid, uid, cid, year, month,
            function (err, numberAffected, res) {

              expect(err)
                .to.not.exist;

              expect(numberAffected)
                .to.eql(1);

              expect(res)
                .to.be.an("object")
                .that.deep.equals({
                  ok: true,
                  n: 1,
                  updatedExisting: true
                });

              cb(err);
            });
        },

        function afterCheck(cb) {

          DailyReport.find({}, function (err, reports) {

            expect(err)
              .to.not.exist;

            expect(reports.length)
              .to.eql(1);

            cb();
          });

        }

      ], done)

    });

  });



  describe('#upsert', function () {

    var aid, uid, cid;
    var score = 35;
    var usage = 125;

    before(function () {
      aid = saved.users.first.aid;
      uid = saved.users.first._id;
    });

    it('should create new document if not exist', function (done) {

      async.series([

        function beforeCheck(cb) {
          DailyReport.count({}, function (err, count) {
            expect(count)
              .to.equal(0);

            cb();
          });
        },


        function newDocument(cb) {

          DailyReport.upsert(aid, uid, cid, Date.now(), usage, score,
            function (err) {
              console.log('newDocument test', arguments);
              cb(err);
            });
        },

        function afterCheck(cb) {

          DailyReport.find({}, function (err, reports) {
            console.log('daily report', err, reports);
            process.exit(1)
            expect(reports.length)
              .to.be.above(0);

            cb();
          });

        }

      ], done)


    });


  });

});
