describe('Worker usage-consumer', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var DailyReport = require('../../api/models/DailyReport');
  var Event = require('../../api/models/Event');


  /**
   * Fixtures
   */

  var EventFixture = require('../fixtures/EventFixture');


  /**
   * Workers
   */

  var worker = require('../../workers/usage-consumer');


  /**
   * Iron mq Queue
   */

  var usageQueue = worker._usageQueue;
  var scoreQueue = worker._scoreQueue;


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done)
  });


  var usr1, usr2, aid, uid1, uid2;

  before(function (done) {
    usr1 = saved.users.first;
    usr2 = saved.users.second;
    aid = usr1.aid.toString();
    uid1 = usr1._id;
    uid2 = usr2._id;

    async.series([

      function (cb) {
        EventFixture(aid, [uid1, uid2], 501, cb);
      },


      function (cb) {
        Event.count({}, function (err, count) {
          console.log('event count', err, count);
          cb()
        })
      }

    ], done);

  });


  describe('#usageMinutes', function () {


    it('should chunk events into five minute slots', function (done) {

      var yesterday = moment()
        .subtract('days', 1)
        .format();

      worker._usageMinutes(aid, yesterday, function (err, res) {

        expect(res)
          .to.not.be.empty;

        _.each(res, function (u) {
          expect(u)
            .to.be.an("object")
            .that.has.property("usage")
            .that.is.a("number")
            .that.is.within(0, 1440);
        });


        done();

      });

    });



  });


  describe('#usageConsumerWorker', function () {


    it(
      'should get aid from usageQueue, aggregate and save usage, and publish aid to scoreQueue',
      function (done) {


        var time = moment();
        var date = time.date();

        async.series(

          [

            function clearUsageQueue(cb) {
              usageQueue().clear(cb);
            },

            function clearScoreQueue(cb) {
              scoreQueue().clear(cb);
            },

            function postToUsageQueue(cb) {
              usageQueue().post(

                JSON.stringify({
                  aid: aid,
                  time: moment()
                    .valueOf()
                }),

                cb);
            },


            function checkBeforeUsage(cb) {

              DailyReport
                .find({}, function (err, usageBefore) {

                  expect(err)
                    .to.not.exist;

                  expect(usageBefore)
                    .to.be.an("array")
                    .that.is.empty;

                  cb();
                });
            },


            function runUsageWorker(cb) {

              worker._usageConsumerWorker(function (
                err) {

                expect(err)
                  .to.not.exist;

                cb();
              })

            },


            function checkAfterUsage(cb) {

              DailyReport.find({}, function (err, usageAfter) {

                expect(err)
                  .to.not.exist;

                expect(usageAfter)
                  .to.be.an("array")
                  .that.is.not.empty;


                _.each(usageAfter, function (h) {

                  h = h.toJSON();

                  expect(h)
                    .to.be.an("object")
                    .that.has.property("du_" + date)
                    .that.is.a("number")
                    .that.is.within(0, 1440);
                });

                cb();
              });
            },

            // should have deleted message from usage queue
            function checkUsageQueue(cb) {
              usageQueue().get({
                n: 1
              }, function (err, response) {

                expect(err)
                  .to.not.exist;

                expect(response)
                  .to.not.exist;

                cb(err);
              })
            },


            // should have added the aid to the score queue
            function checkScoreQueue(cb) {
              scoreQueue().get({
                n: 1
              }, function (err, response) {

                expect(err)
                  .to.not.exist;

                var appData = JSON.parse(response.body);

                expect(appData)
                  .to.have.property('aid')
                  .that.eqls(aid);

                expect(appData)
                  .to.have.property('time')
                  .that.is.a('number');

                cb(err);
              })
            }

          ],

          done)


      });


  });

});
