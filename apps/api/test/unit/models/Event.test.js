describe('Model Event', function () {


  /**
   * Models
   */

  var Event = require('../../../api/models/Event');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedEvent;



  describe('#create', function () {


    it('should return error if appId is not present', function (done) {

      var newEvent = {
        userId: randomId,
        sessionId: randomId,
        type: 'pageview'
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.appId.name)
          .to.eql('ValidatorError');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it('should return error if userId is not present', function (done) {

      var newEvent = {
        appId: randomId,
        sessionId: randomId,
        type: 'pageview'
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.userId.name)
          .to.eql('ValidatorError');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it('should return error if sessionId is not present', function (done) {

      var newEvent = {
        appId: randomId,
        userId: randomId,
        type: 'pageview'
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.sessionId.name)
          .to.eql('ValidatorError');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it('should return error if type is not present', function (done) {

      var newEvent = {
        appId: randomId,
        userId: randomId,
        sessionId: randomId
      };

      Event.create(newEvent, function (err, evn) {
        expect(err)
          .to.exist;
        expect(err.errors.type.name)
          .to.eql('ValidatorError');
        expect(evn)
          .not.to.exist;
        done();
      });
    });


    it(
      'should return error if type is none of [pageview, feature]',
      function (done) {

        var newEvent = {
          appId: randomId,
          userId: randomId,
          sessionId: randomId,
          type: 'randomType'
        };

        Event.create(newEvent, function (err, evn) {
          expect(err)
            .to.exist;
          expect(err.errors.type.name)
            .to.eql('ValidatorError');
          done();
        });

      });


    it(
      'should create new event if appId, userId, sessionId, type are present',
      function (done) {

        var newEvent = {
          appId: randomId,
          userId: randomId,
          sessionId: randomId,
          type: 'pageview'
        };

        Event.create(newEvent, function (err, evn) {

          expect(err)
            .to.not.exist;
          expect(evn)
            .to.be.an('object');

          savedEvent = evn;

          expect(evn.type)
            .to.eql('pageview');

          done();
        });

      });

    it('should add createdAt to new event', function () {
      expect(savedEvent)
        .to.have.property('createdAt');
    });

    it('should not add updatedAt timestamp to new event',
      function () {
        expect(savedEvent)
          .not.to.have.property('updatedAt');
      });

  });

});
