describe('Worker usagePublisher', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var App = require('../../api/models/App');


  /**
   * Workers
   */

  var worker = require('../../workers/usage-publisher');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;
  var queuedAppIds = [];

  before(function (done) {

    async.series([

      function testDb(cb) {
        setupTestDb(cb);
      },

      function makeOneAppActive(cb) {

        saved.apps.first.isActive = true;
        saved.apps.first.save(done);

      }

    ], done);


  });


  describe('#findActiveApps', function () {


    it('should return an array of active app ids', function (done) {

      var timeNow = Date.now();

      worker._findActiveApps(timeNow, function (err, ids) {
        expect(err)
          .to.not.exist;

        expect(ids)
          .to.be.an("array")
          .that.has.length(1);

        _.each(ids, function (id) {
          queuedAppIds.push(id._id.toString());
        });

        done();
      })


    });

  });


  describe('#cronFunc', function () {


    it(
      'should find and queue active apps, and update queuedUsage timestamps',
      function (done) {

        async.series(

          [

            function queuedUsageDontExist(cb) {

              // check it for the first saved app

              App
                .findById(saved.apps.first._id)
                .exec(function (err, app) {

                  expect(err)
                    .to.not.exist;

                  expect(app)
                    .to.not.have.property('queuedUsage');

                  cb();
                });
            },

            function makeRequest(cb) {

              worker._cronFunc(function (err, queueIds, appData,
                numberAffected) {

                expect(err)
                  .to.not.exist;
                expect(queueIds)
                  .to.be.a("string");

                expect(appData)
                  .to.be.an("array")
                  .that.has.length(1);


                _.each(appData, function (d, i) {
                  d = JSON.parse(d);

                  expect(d)
                    .to.have.property('aid')
                    .that.is.a('string')
                    .and.deep.equals(queuedAppIds[i]);

                  expect(d)
                    .to.have.property('updateTime')
                    .that.is.a('number');

                });

                cb();
              });

            },


            function shouldHaveUpdatedQueuedUsage(cb) {

              // check it for the first saved app

              App
                .findById(saved.apps.first._id)
                .exec(function (err, app) {

                  expect(err)
                    .to.not.exist;

                  expect(app)
                    .to.have.property('queuedUsage')
                    .that.is.a('date');

                  cb();
                });
            },

            function makeRequestAgain(cb) {

              // should not queue app again, because queuedUsage was just set
              // now!

              worker._cronFunc(function (err, queueIds, appData,
                numberAffected) {

                expect(err)
                  .to.exist
                  .and.to.have.property('name', 'QueueError')

                expect(err)
                  .to.have.property('message',
                    'NO_APPS_FOUND_FOR_QUEUEING');

                expect(queueIds)
                  .to.not.exist;

                expect(appData)
                  .to.not.exist;

                cb();
              });

            },


          ],

          done

        );


      });


  });

});
