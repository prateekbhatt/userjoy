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

      worker._findActiveApps(function (err, ids) {
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


    it('should find and queue active apps', function (done) {

      worker._cronFunc(function (err, queueIds, appData, numberAffected) {

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
            .to.have.property('time')
            .that.is.a('number');

        })


        done();
      });

    });

  });


});
