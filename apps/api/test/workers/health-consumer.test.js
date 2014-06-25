describe('Worker health-consumer', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var Segment = require('../../api/models/Segment');
  var User = require('../../api/models/User');


  /**
   * Workers
   */

  var worker = require('../../workers/health-consumer');


  /**
   * Iron mq Queue
   */

  var healthQueue = worker._healthQueue;


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done)
  });


  var aid, accountId;

  before(function (done) {
    aid = saved.apps.first._id.toString();
    accountId = saved.accounts.first._id;

    // createPredefinedSegments
    Segment.createPredefined(aid, accountId, done);

  });


  describe('#runHealthQuery', function () {


    it('should run the health query and update the health attribute',
      function (done) {

        var worstUid;
        var health = 'poor';

        async.series(

          [


            // create user with poor score (less than 34)
            function createUserWithPoorScoreAndGoodHealth(cb) {

              User.create(

                {
                  aid: aid,
                  email: 'random12345@gmail123.com',

                  // by default, less than 34 is poor health
                  score: 10,

                  health: 'good'
                },

                function (err, user) {

                  expect(err)
                    .to.not.exist;


                  // health before is good, afterwards it should be poor
                  expect(user)
                    .to.have.property('health')
                    .that.is.a('string')
                    .and.eqls('good');


                  worstUid = user._id;

                  cb();
                });

            },


            function run(cb) {

              worker._runHealthQuery(aid, health,
                function (err) {

                  expect(err)
                    .to.not.exist;

                  cb();

                });

            },

            function shouldHaveUpdatedHealthToPoor(cb) {

              User.findById(worstUid, function (err, user) {

                expect(user)
                  .to.have.property("health")
                  .that.is.a('string')
                  .and.eqls('poor');

                cb(err, user);

              })

            }
          ],

          done

        )


      });

  });


  describe('#healthConsumerWorker', function () {


    it('should fetch app id from queue, run query, update health',
      function (done) {

        var poorUid;

        async.series(

          [

            // create user with poor score (less than 34), and good health
            function createUserWithPoorScoreAndGoodHealth(cb) {

              User.create(

                {
                  aid: aid,
                  email: 'random12345@gmail123.com',

                  // by default, less than 34 is poor health
                  score: 10,

                  health: 'good'
                },

                function (err, user) {

                  expect(err)
                    .to.not.exist;


                  // health before is good, afterwards it should be poor
                  expect(user)
                    .to.have.property('health')
                    .that.is.a('string')
                    .and.eqls('good');


                  poorUid = user._id;

                  cb();
                });

            },

            function clearHealthQueue(cb) {
              healthQueue().clear(cb);
            },

            function postToHealthQueue(cb) {
              healthQueue().post(

                JSON.stringify({
                  aid: aid
                }),

                cb);
            },

            function checkBeforeHealth(cb) {

              User.findById(poorUid, function (err, user) {

                expect(err)
                  .to.not.exist;

                expect(user)
                  .to.have.property('health')
                  .that.eqls('good');

                cb();
              });
            },


            function runHealthWorker(cb) {

              var cid;

              worker._healthConsumerWorker(function (err) {

                expect(err)
                  .to.not.exist;

                cb();
              })

            },


            function checkAfterHealth(cb) {

              User.findById(poorUid, function (err, user) {

                expect(err)
                  .to.not.exist;

                expect(user)
                  .to.have.property('health')
                  .that.eqls('poor');

                cb();
              });
            },

            // should have deleted message from health queue
            function checkHealthQueue(cb) {
              healthQueue().get({
                n: 1
              }, function (err, response) {

                expect(err)
                  .to.not.exist;

                expect(response)
                  .to.not.exist;

                cb(err);
              })
            },

          ],

          done)


      });


  });


});
