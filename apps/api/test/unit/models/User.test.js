describe('Model User', function () {


  /**
   * npm dependencies
   */

  var moment = require('moment');
  var mongoose = require('mongoose');


  /**
   * Models
   */

  var User = require('../../../api/models/User');


  /**
   * Test variables
   */

  var randomId = mongoose.Types.ObjectId;


  before(function (done) {
    setupTestDb(done)
  });


  describe('#findOrCreate', function () {

    var existingUser;
    var savedUser;

    before(function () {
      existingUser = saved.users.first.toJSON();
    });

    var newUser = {
      email: 'prattbhatt@gmail.com'
    };

    // before(function (done) {
    //   newUser.aid = randomId();
    //   User.findOrCreate(newUser, done);
    // });


    it('should return error if user_id and email are missing from user',
      function (done) {

        var testUser = {
          name: 'PrateekDoDataDo'
        };

        User.findOrCreate(randomId(), testUser, function (err, usr) {
          expect(err)
            .to.exist;
          expect(err.message)
            .to.eql('NO_EMAIL_OR_USER_ID');
          done();
        });
      });


    it('should return user if user exists', function (done) {

      User.findOrCreate(existingUser.aid, existingUser, function (err,
        usr) {

        expect(err)
          .to.not.exist;

        expect(usr._id)
          .to.eql(existingUser._id);

        expect(usr.email)
          .to.eql(existingUser.email);

        done();
      });
    });

    it('should create user if user does not exist', function (done) {

      var id = randomId();

      var newUser = {
        email: id + '@dodatado.com',
        country: 'IN',
        ip: '115.118.149.224',
        joined: moment()
          .unix() * 1000,
        meta: {
          plan: 'Free Tier',
          amount: 40
        },
        plan: 'enterprise',
        revenue: 499,
        status: 'trial',
      };

      User.findOrCreate(id, newUser, function (err, usr) {

        expect(err)
          .to.not.exist;

        expect(usr.toJSON())
          .to.be.an('object')
          .and.to.have.property("meta")
          .that.is.an("array")
          .that.has.length(2)
          .that.deep.equals([{
            k: 'plan',
            v: 'Free Tier'
          }, {
            k: 'amount',
            v: 40
          }]);

        savedUser = usr;

        expect(usr.email)
          .to.eql(newUser.email);

        expect(usr.aid)
          .to.eql(id);

        expect(usr)
          .to.have.property("ip")
          .that.is.a("string")
          .that.equals(newUser.ip);

        expect(usr)
          .to.have.property("country")
          .that.is.a("string")
          .that.equals(newUser.country);

        expect(usr)
          .to.have.property("joined")
          .that.is.a("date");
        expect(moment(usr.joined)
          .startOf('day')
          .unix())
          .to.eql(moment(newUser.joined)
            .startOf('day')
            .unix());

        expect(usr)
          .to.have.property("plan")
          .that.is.a("string")
          .that.equals(newUser.plan);

        expect(usr)
          .to.have.property("revenue")
          .that.is.a("number")
          .that.equals(newUser.revenue);

        expect(usr)
          .to.have.property("status")
          .that.is.a("string")
          .that.equals(newUser.status);

        done();
      });

    });


    it('should add ct timestamp to user', function () {
      expect(savedUser)
        .to.have.property('ct');
    });


    it('should add ut timestamp to user', function () {
      expect(savedUser)
        .to.have.property('ut');
    });

    it('should not add ct timestamp', function () {
      expect(savedUser)
        .to.have.property('ct');
    });

    it('should not add lastSeen timestamp', function () {
      expect(savedUser)
        .to.have.property('lastSeen')
        .that.is.a('date');
    });

    it('should add default health as average', function () {
      expect(savedUser)
        .to.have.property('health')
        .that.is.a('string')
        .and.eqls('average');
    });

    it('should add default score as 50', function () {

      expect(savedUser)
        .to.have.property('score')
        .that.is.a('number')
        .and.eqls(50);
    });

    it('should have totalSessions as 1 when the user is created',
      function () {
        expect(savedUser.totalSessions)
          .to.eql(1);
      });


    it(
      'should return error if billing status is not in [trial, free, paying, cancelled]',
      function (done) {

        var aid = randomId();

        var testUser = {
          user_id: 'unique_user_id_here',
          status: 'randomStatus',
        };


        User.findOrCreate(aid, testUser, function (err, usr) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql(
              "Billing status must be one of 'trial', 'free', 'paying' or 'cancelled'"
          );

          done();
        });
      });


    it('should store company data if exists', function (done) {

      var aid = randomId();

      var testUser = {
        email: 'care@dodatado.com',
        companies: [{
          cid: randomId(),
          name: 'helloworld'
        }]
      };

      User.findOrCreate(aid, testUser, function (err, usr) {

        expect(err)
          .not.to.exist;

        expect(usr)
          .to.be.an('object');

        expect(usr.companies)
          .to.be.an('array');

        expect(usr.companies.length)
          .to.eql(1);

        expect(usr.companies[0].name)
          .to.eql('helloworld');
        done();
      });
    });


    it('should return error if company data doesnot have cid',
      function (done) {

        var aid = randomId();

        var testUser = {
          email: 'care@dodatado.com',
          companies: [{
            name: 'helloworld'
          }]
        };

        User.findOrCreate(aid, testUser, function (err, usr) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql('NO_COMPANY_ID');

          done();
        });
      });



  });


  describe('#addCompany', function () {

    var existingUser;
    var savedUser;

    before(function () {
      existingUser = saved.users.first;

      expect(existingUser.companies)
        .to.be.empty;

    });

    it('should add company',
      function (done) {

        var company = saved.companies.first.toJSON();

        existingUser.addCompany(company._id, company.name, function (err,
          usr) {

          expect(err)
            .to.not.exist;

          expect(usr.companies)
            .to.be.an('array')
            .that.has.length(1);

          expect(usr.companies[0].cid)
            .to.eql(company._id);

          expect(usr.companies[0].name)
            .to.eql(company.name);

          done();
        });
      });

    it('should return error if company already exists in User-companies',
      function (done) {

        var company = saved.companies.first.toJSON();

        existingUser.addCompany(company._id, company.name, function (err,
          usr) {

          expect(err)
            .to.exist;

          expect(err.message)
            .to.eql('USER_ALREADY_BELONGS_TO_COMPANY');
          done();
        });
      });

  });


  describe('#setHealth', function () {

    var existingUser;
    var savedUser;

    before(function () {
      existingUser = saved.users.first;
    });

    it('should return error if health is not in [good, average, poor]',
      function (done) {

        var uid = existingUser._id;
        var health = 'good123';

        User.setHealth(uid, health, function (err, usr) {

          expect(err)
            .to.exist
            .and.to.be.an("object")
            .and.has.property('errors')
            .that.is.an('object')
            .and.has.property('health')
            .that.is.an('object')
            .and.has.property('message')
            .that.is.a('string')
            .and.eqls(
              'Health status must be one of \'good\', \'average\' or \'poor\''
          );

          done();
        });
      });


    it('should update health',
      function (done) {

        var uid = existingUser._id;
        var health = 'good';

        expect(existingUser.health)
          .to.eql('average');

        User.setHealth(uid, health, function (err, usr) {

          expect(err)
            .to.not.exist;

          expect(usr)
            .to.exist
            .and.to.be.an("object")
            .that.has.property('health')
            .that.is.a('string')
            .and.eqls(health);;

          done();
        });
      });

  });


  describe('#setScore', function () {

    var existingUser;
    var savedUser;

    before(function () {
      existingUser = saved.users.first;
    });

    it('should return error if score is less than 0',
      function (done) {

        var uid = existingUser._id;
        var score = -1;

        User.setScore(uid, score, function (err, usr) {

          expect(err)
            .to.exist
            .and.to.be.an("object")
            .and.has.property('errors')
            .that.is.an('object')
            .and.has.property('score')
            .that.is.an('object')
            .and.has.property('message')
            .that.is.a('string')
            .and.eqls(
              "Path `score` (-1) is less than minimum allowed value (0)."
          );

          done();
        });
      });

    it('should return error if score is greater than 100',
      function (done) {

        var uid = existingUser._id;
        var score = 101;

        User.setScore(uid, score, function (err, usr) {

          expect(err)
            .to.exist
            .and.to.be.an("object")
            .and.has.property('errors')
            .that.is.an('object')
            .and.has.property('score')
            .that.is.an('object')
            .and.has.property('message')
            .that.is.a('string')
            .and.eqls(
              "Path `score` (101) is more than maximum allowed value (100)."
          );

          done();
        });
      });


    it('should update score',
      function (done) {

        var uid = existingUser._id;
        var score = 55;

        expect(existingUser.score)
          .to.eql(50);

        User.setScore(uid, score, function (err, usr) {

          expect(err)
            .to.not.exist;

          expect(usr)
            .to.exist
            .and.to.be.an("object")
            .that.has.property('score')
            .that.is.a('number')
            .and.eqls(score);

          done();
        });
      });

  });




});
