describe.only('Model Session', function () {


  /**
   * Models
   */

  var Session = require('../../../api/models/Session');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedSession;



  describe('#create', function () {


    // before(function (done) {
    //   Session.create(newSession, done);
    // });

    it('should return error if appId is not present', function (done) {

      var newSession = {
        platform: 'Desktop',
        userId: randomId
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.exist;
        expect(sess)
          .not.to.exist;
        done();
      });
    });


    it('should return error if userId is not present', function (done) {

      var newSession = {
        platform: 'Desktop',
        appId: randomId
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.exist;
        expect(sess)
          .not.to.exist;
        done();
      });
    });


    it('should create new session if appId and userId are present',
      function (done) {

        var newSession = {
          platform: 'Desktop',
          appId: randomId,
          userId: randomId
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.not.exist;
          expect(sess)
            .to.be.an('object');
          expect(sess.platform)
            .to.eql('Desktop');

          savedSession = sess;

          done();
        });

      });

    it('should add createdAt to new session', function () {
      expect(savedSession)
        .to.have.property('createdAt');
    });

    it('should not add updatedAt timestamp to new session',
      function () {
        expect(savedSession)
          .not.to.have.property('updatedAt');
      });

  });

});
