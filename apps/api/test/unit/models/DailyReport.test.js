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


  describe('#upsert', function () {

    var aid, uid, cid;
    var time = moment();
    var year = time.year();
    var month = time.month();
    var timestamp = moment()
      .format();

    var score = 65;
    var usage = 155;

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

          DailyReport.upsert(aid, uid, cid, timestamp, score,
            usage, function (err, numberAffected, res) {

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

            var time = moment(timestamp);

            var date = time.date();
            var year = time.year();
            var month = time.month();

            var daysInMonth = time.endOf('month')
              .date();

            var report = reports[0].toJSON();

            expect(err)
              .to.not.exist;

            expect(reports.length)
              .to.eql(1);

            expect(report.uid.toString())
              .to.eql(uid.toString());

            expect(report.aid.toString())
              .to.eql(aid.toString());

            expect(report)
              .to.have.property('y', year);

            expect(report)
              .to.have.property('m', month);

            expect(report)
              .to.have.property('du_' + date, usage);

            expect(report)
              .to.have.property('ds_' + date, score);

            for (var i = 1; i <= daysInMonth; i++) {

              // all other dates should be initialized to 0
              if (i === date) {
                continue;
              }

              expect(report)
                .to.have.property('du_' + i);

              expect(report)
                .to.have.property('ds_' + i);

            };

            cb();
          });

        }

      ], done)

    });


    it(
      'should update usage if valid usage is provided and document exists',
      function (done) {

        var newScore;
        var newUsage = 185;


        async.series([


          function newDocument(cb) {

            DailyReport.upsert(aid, uid, cid, timestamp, newScore,
              newUsage, function (err, numberAffected, res) {

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

              var time = moment(timestamp);

              var date = time.date();
              var year = time.year();
              var month = time.month();

              var daysInMonth = time.endOf('month')
                .date();

              var report = reports[0].toJSON();

              expect(err)
                .to.not.exist;

              expect(reports.length)
                .to.eql(1);

              expect(report.uid.toString())
                .to.eql(uid.toString());

              expect(report.aid.toString())
                .to.eql(aid.toString());

              expect(report)
                .to.have.property('y', year);

              expect(report)
                .to.have.property('m', month);

              expect(report)
                .to.have.property('du_' + date, newUsage);

              expect(report)
                .to.have.property('ds_' + date, score);

              for (var i = 1; i <= daysInMonth; i++) {

                // all other dates should be initialized to 0
                if (i === date) {
                  continue;
                }

                expect(report)
                  .to.have.property('du_' + i);

                expect(report)
                  .to.have.property('ds_' + i);

              };

              cb();
            });

          }

        ], done)

      });

    it(
      'should update score if valid score is provided and document exists',
      function (done) {

        var newScore = 99;
        var newUsage;


        async.series([


          function newDocument(cb) {

            DailyReport.upsert(aid, uid, cid, timestamp, newScore,
              newUsage, function (err, numberAffected, res) {

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

              var time = moment(timestamp);

              var date = time.date();
              var year = time.year();
              var month = time.month();

              var daysInMonth = time.endOf('month')
                .date();

              var report = reports[0].toJSON();

              expect(err)
                .to.not.exist;

              expect(reports.length)
                .to.eql(1);

              expect(report.uid.toString())
                .to.eql(uid.toString());

              expect(report.aid.toString())
                .to.eql(aid.toString());

              expect(report)
                .to.have.property('y', year);

              expect(report)
                .to.have.property('m', month);

              expect(report)
                .to.have.property('du_' + date);

              expect(report)
                .to.have.property('ds_' + date, newScore);

              for (var i = 1; i <= daysInMonth; i++) {

                // all other dates should be initialized to 0
                if (i === date) {
                  continue;
                }

                expect(report)
                  .to.have.property('du_' + i);

                expect(report)
                  .to.have.property('ds_' + i);

              };

              cb();
            });

          }

        ], done)

      });


    it('should return error if score > 100',
      function (done) {

        var newScore = 101;
        var newUsage;

        DailyReport.upsert(aid, uid, cid, timestamp, newScore,
          newUsage, function (err, numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid score');

            done()
          })

      });

    it('should return error if score < 0',
      function (done) {

        var newScore = -1;
        var newUsage;

        DailyReport.upsert(aid, uid, cid, timestamp, newScore,
          newUsage, function (err, numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid score');

            done()
          })

      });


    it('should return error if usage > 1440',
      function (done) {

        var newScore;
        var newUsage = 1441;

        DailyReport.upsert(aid, uid, cid, timestamp, newScore,
          newUsage, function (err, numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid usage');

            done()
          })

      });

    it('should return error if usage < 0',
      function (done) {

        var newScore;
        var newUsage = -1;

        DailyReport.upsert(aid, uid, cid, timestamp, newScore,
          newUsage, function (err, numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid usage');

            done()
          })

      });


    it('should return error if invalid timestamp is provided',
      function (done) {

        var timestamp = '43294AD';

        DailyReport.upsert(aid, uid, cid, timestamp, score,
          usage, function (err, numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid time');

            done()
          })

      });


    it('should throw error if all arguments are not provided',
      function (done) {

        function test() {
          DailyReport.upsert(aid, uid, cid, score, usage, function (err,
            numberAffected, res) {

            expect(err)
              .to.exist
              .and.have.property('message',
                'DailyReport upsert provide valid usage');


          });
        }

        expect(test)
          .to.
        throw ('DailyReport upsert requires all arguments');

        done();

      });
  });

});
