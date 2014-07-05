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
            .to.eql(6);

          expect(err.errors.amId.message)
            .to.eql('Invalid automessage id');

          expect(err.errors.body.message)
            .to.eql('Provide notification body');

          expect(err.errors.senderName.message)
            .to.eql('Provide sender name');

          expect(err.errors.senderEmail.message)
            .to.eql('Provide sender email');

          expect(err.errors.title.message)
            .to.eql('Provide notification title');

          expect(notf)
            .to.not.exist;

          done();
        })

      });


    it('should create notification', function (done) {

      var newNotification = {
        amId: ObjectId(),
        body: 'Hello World',
        senderEmail: 'prattbhatt@gmail.com',
        senderName: 'Prateek Bhatt',
        title: 'In-App welcome',
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
          .to.have.property('senderEmail', newNotification.senderEmail);

        expect(notf)
          .to.have.property('senderName', newNotification.senderName);

        expect(notf)
          .to.have.property('title', newNotification.title);

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

  });

});
