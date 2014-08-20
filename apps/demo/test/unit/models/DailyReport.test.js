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
  var aid, uid, cid;


  before(function (done) {
    setupTestDb(function (err) {
      if (err) return done(err);
      aid = saved.users.first.aid;
      uid = saved.users.first._id;
      done();
    });
  });


  describe('#upsert', function () {

    var time = moment.utc();
    var year = time.year();
    var month = time.month();
    var timestamp = moment.utc()
      .format();

    var score = 65;
    var usage = 155;


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

            var time = moment.utc(timestamp);

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

              // all other dates should be initialized to null
              if (i === date) {
                continue;
              }

              expect(report)
                .to.have.property('du_' + i, null);

              expect(report)
                .to.have.property('ds_' + i, null);

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

              var time = moment.utc(timestamp);

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
      'should update usage if usage is 0 and document exists',
      function (done) {

        var newScore;
        var newUsage = 0;


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

              var time = moment.utc(timestamp);

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

              var time = moment.utc(timestamp);

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


    it(
      'should update score if score is 0 and document exists',
      function (done) {

        var newScore = 0;
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

              var time = moment.utc(timestamp);

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

              }

              cb();
            });

          }

        ], done);

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

            done();
          });

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

            done();
          });

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

            done();
          });

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

            done();
          });

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

            done();
          });

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


  describe('#get', function () {

    before(function (done) {

      var thisMonth = moment.utc()
        .format();

      var lastMonth = moment.utc()
        .subtract('month', 1)
        .format();

      var score = 54;

      var usage = 432;

      async.series([

        function oneMonth(cb) {
          DailyReport.upsert(aid, uid, cid, thisMonth, score, usage,
            cb);
        },

        function secondMonth(cb) {
          DailyReport.upsert(aid, uid, cid, lastMonth, score, usage,
            cb);
        }

      ], done)


    });


    it('should get the usage', function (done) {

      var to = moment.utc();

      var from = moment.utc()
        .subtract('days', 28);

      var noOfDays = to.diff(from, 'days');

      var type = 'usage';
      DailyReport.get(type, aid, uid, undefined, from.format(), to.format(),
        function (err, data) {

          expect(err)
            .to.not.exist;

          expect(data)
            .to.be.an('object');

          expect(Object.keys(data)
            .length)
            .to.eql(noOfDays);

          expect(data)
            .to.have.property(to.startOf('day')
              .unix()
              .toString());

          done();
        });

    });


    it(
      'should return error if more than 28 days diff between to and from timestamps',
      function (done) {

        var to = moment.utc();

        var from = moment.utc()
          .subtract('days', 29);

        var noOfDays = to.diff(from, 'days');

        var type = 'usage';

        DailyReport.get(type, aid, uid, undefined, from.format(), to.format(),
          function (err, data) {

            expect(err)
              .to.exist
              .and.to.have.property('message')
              .that.equals(
                'Currently not allowed to get data more than 28 days wide'
            );

            done();
          });

      });


    it(
      'should return error if type is not one of usage / score',
      function (done) {

        var to = moment.utc();

        var from = moment.utc()
          .subtract('days', 65);

        var noOfDays = to.diff(from, 'days');

        var type = 'usageRandom';

        DailyReport.get(type, aid, uid, undefined, from.format(), to.format(),
          function (err, data) {

            expect(err)
              .to.exist
              .and.to.have.property('message')
              .that.equals(
                'type must be one of usage / score'
            );

            done();
          });

      });


  });



});
