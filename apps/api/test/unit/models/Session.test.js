describe('Model Session', function () {


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


    it('should return error if aid is not present', function (done) {

      var newSession = {
        pl: 'Desktop',
        uid: randomId
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.exist;
        expect(err.errors.aid.message)
          .to.eql('Invalid aid');
        expect(sess)
          .not.to.exist;
        done();
      });
    });


    it('should return error if uid is not present', function (done) {

      var newSession = {
        platform: 'Desktop',
        aid: randomId
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.exist;
        expect(err.errors.uid.message)
          .to.eql('Invalid uid');
        expect(sess)
          .not.to.exist;
        done();
      });
    });


    it('should create new session if aid and uid are present',
      function (done) {

        var newSession = {
          pl: 'Desktop',
          aid: randomId,
          uid: randomId
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.not.exist;
          expect(sess)
            .to.be.an('object');
          expect(sess.pl)
            .to.eql('Desktop');

          savedSession = sess;

          done();
        });

      });

    it('should add ct (created) timestamp to new session', function () {
      expect(savedSession)
        .to.have.property('ct');
    });

    it('should add ut (updated) timestamp to new session',
      function () {
        expect(savedSession)
          .to.have.property('ut');
      });

    it('should add events to ev embedded document if present', function (
      done) {
      var newSession = {
        pl: 'Desktop',
        aid: randomId,
        uid: randomId,
        ev: [{
          t: 'pageview',
          d: 'app.dodatado.com',
          p: '/login',
          n: 'Login Page',
          f: 'Authentication'
        }]
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.not.exist;

        expect(sess.ev)
          .to.have.length(1);

        expect(sess.ev[0].n)
          .to.eql('Login Page');

        done();
      });
    });


    it('should add created timestamp (ct) to new event', function (
      done) {
      var newSession = {
        pl: 'Desktop',
        aid: randomId,
        uid: randomId,
        ev: [{
          t: 'pageview',
          d: 'app.dodatado.com',
          p: '/login',
          n: 'Login Page',
          f: 'Authentication'
        }]
      };

      Session.create(newSession, function (err, sess) {
        expect(err)
          .to.not.exist;

        expect(sess.ev[0])
          .to.have.property('ct');

        done();
      });
    });


    it('should return error if event document does not have domain',
      function (done) {
        var newSession = {
          pl: 'Desktop',
          aid: randomId,
          uid: randomId,
          ev: [{
            t: 'pageview',
            p: '/login',
            n: 'Login Page',
            f: 'Authentication'
          }]
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.exist;

          expect(sess)
            .to.not.exist;

          expect(err.errors['ev.0.d'].message)
            .to.eql('Invalid domain');

          done();
        });
      });


    it('should return error if event document does not have path',
      function (done) {
        var newSession = {
          pl: 'Desktop',
          aid: randomId,
          uid: randomId,
          ev: [{
            t: 'pageview',
            d: 'dodatado.com',
            n: 'Login Page',
            f: 'Authentication'
          }]
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.exist;

          expect(sess)
            .to.not.exist;

          expect(err.errors['ev.0.p'].message)
            .to.eql('Invalid path');

          done();
        });
      });


    it(
      'should return error if event type is not present',
      function (done) {
        var newSession = {
          pl: 'Desktop',
          aid: randomId,
          uid: randomId,
          ev: [{
            d: 'dodatado.com',
            p: '/login',
            n: 'Login Page',
            f: 'Authentication'
          }]
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.exist;

          expect(sess)
            .to.not.exist;

          expect(err.errors['ev.0.t'].message)
            .to.eql("Event type is required");

          done();
        });
      });

    it(
      'should return error if event type is not in ["feature", "pageview"]',
      function (done) {
        var newSession = {
          pl: 'Desktop',
          aid: randomId,
          uid: randomId,
          ev: [{
            t: 'randomType',
            d: 'dodatado.com',
            p: '/login',
            n: 'Login Page',
            f: 'Authentication'
          }]
        };

        Session.create(newSession, function (err, sess) {
          expect(err)
            .to.exist;

          expect(sess)
            .to.not.exist;

          expect(err.errors['ev.0.t'].message)
            .to.eql("Event type must be one of 'pageview' or 'feature'");

          done();
        });
      });

  });

  describe('#newEvent', function () {

    it('should add a new event to an existing session', function (done) {

      var sid = savedSession._id;
      var event = {
        t: 'feature',
        p: '/users',
        d: 'dodatado.com',
        f: 'Users',
        n: 'Segment Users'
      };

      Session.newEvent(sid, event, function (err, sess) {

        expect(err)
          .to.not.exist;

        expect(sess.ev)
          .to.have.length(1);

        expect(sess.ev[0].n)
          .to.eql('Segment Users');

        done();
      });

    });

  });

});
