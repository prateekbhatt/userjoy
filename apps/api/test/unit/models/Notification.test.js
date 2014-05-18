describe('Model Notification', function () {

  /**
   * npm dependencies
   */

  var ObjectId = require('mongoose')
    .Types.ObjectId;


  /**
   * Models
   */

  var Notification = require('../../../api/models/Notification');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedNotification;


  before(function (done) {
    setupTestDb(done)
  });


  describe('#create', function () {

    it('should return error if amId/body/uid is not provided',
      function (done) {

        var newNotf = {};

        Notification.create(newNotf, function (err, notf) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(3);

          expect(err.errors.amId.message)
            .to.eql('Invalid automessage id');

          expect(err.errors.body.message)
            .to.eql('Provide notification body');

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(notf)
            .to.not.exist;

          done();
        })

      });


    it('should create notification', function (done) {

      var newNotification = {
        amId: ObjectId(),
        body: 'Hello World',
        sender: 'Prateek Bhatt',
        uid: ObjectId(),
      };

      Notification.create(newNotification, function (err, notf) {

        expect(err)
          .to.not.exist;

        expect(notf)
          .to.be.an('object');

        savedNotification = notf;

        expect(notf.amId.toString())
          .to.eql(newNotification.amId.toString());

        expect(notf)
          .to.have.property('body', newNotification.body);

        expect(notf)
          .to.have.property('sender', newNotification.sender);

        expect(notf.uid.toString())
          .to.eql(newNotification.uid.toString());

        done();
      });

    });

    it('should add ct (created) timestamp', function () {
      expect(savedNotification)
        .to.have.property('ct');

    });


    it('should not add ut (updated) timestamp', function () {
      // ut timestamp is not required in auto notifications
      expect(savedNotification)
        .to.not.have.property('ut');

    });


    it('should add seen status as false', function () {

      expect(savedNotification)
        .to.have.property('seen', false);

    });

  });

  describe('#opened', function () {

    it('should update seen status to true', function (done) {

      var notf = saved.notifications.first;

      expect(notf.seen)
        .to.be.false;

      Notification.opened(notf._id, function (err, updatedNotf) {

        expect(err)
          .to.not.exist;

        expect(updatedNotf._id)
          .to.eql(notf._id);

        expect(updatedNotf.seen)
          .to.be.true;

        done();
      })
    });
  });

});
