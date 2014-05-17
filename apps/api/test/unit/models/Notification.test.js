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

    it('should return error if accid/aid/body/title/uid is not provided',
      function (done) {

        var newNotf = {};

        Notification.create(newNotf, function (err, notf) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(5);

          expect(err.errors.accid.message)
            .to.eql('Invalid account id');

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.body.message)
            .to.eql('Provide notification body');

          expect(err.errors.title.message)
            .to.eql('Provide notification title');

          expect(err.errors.uid.message)
            .to.eql('Invalid uid');

          expect(notf)
            .to.not.exist;

          done();
        })

      });


    it('should create notification', function (done) {

      var newNotification = {
        accid: ObjectId(),
        aid: ObjectId(),
        body: 'Hello World',
        sender: 'Prateek Bhatt',
        title: 'Subject I Am',
        uid: ObjectId(),
      };

      Notification.create(newNotification, function (err, notf) {

        expect(err)
          .to.not.exist;

        expect(notf)
          .to.be.an('object');

        savedNotification = notf;

        expect(notf.aid.toString())
          .to.eql(newNotification.aid.toString());

        expect(notf.body)
          .to.eql(newNotification.body);

        expect(notf.title)
          .to.eql(newNotification.title);

        expect(notf.sub)
          .to.eql(newNotification.sub);

        expect(notf.uid.toString())
          .to.eql(newNotification.uid.toString());

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedNotification)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedNotification)
        .to.have.property('ut');

    });


    it('should add seen values as false', function () {

      expect(savedNotification.seen)
        .to.eql(false);

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
