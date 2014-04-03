describe('Model User', function () {

  var User = require('../../../api/models/User');

  var randomId = '532d6bf862d673ba7131812a';

  describe('#getOrCreate', function () {

    var newUser = {
      email: 'prattbhatt@gmail.com'
    };

    before(function (done) {
      newUser.appId = randomId;
      User.create(newUser, done);
    });

    it('should return user if user exists', function (done) {
      User.getOrCreate(randomId, newUser, function (err, usr) {
        expect(err)
          .to.not.exist;
        expect(usr)
          .to.be.ok;
        expect(usr.email)
          .to.eql(newUser.email);
        expect(usr)
          .to.have.property('createdAt');
        done();
      });
    });

    it('should create user if user does not exist', function (done) {

      var newUser = {
        email: 'savinay@dodatado.com'
      };

      User.getOrCreate(randomId, newUser, function (err, usr) {
        expect(err)
          .to.not.exist;
        expect(usr)
          .to.be.ok;
        expect(usr.email)
          .to.eql(newUser.email);
        expect(usr)
          .to.have.property('createdAt');
        done();
      });

    });

    it('should throw error if any argument is missing', function (done) {

      var testFunc = function () {
        User.getOrCreate({}, function () {});
      };

      expect(testFunc)
        .to.
      throw ('undefined is not a function');
      done();
    });

    it('should return error if user_id and email are missing from user',
      function (done) {

        var testUser = {
          name: 'PrateekDoDataDo'
        };

        User.getOrCreate(randomId, testUser, function (err, usr) {
          expect(err)
            .to.exist;
          expect(err.message)
            .to.eql('Please send user_id or email to identify user');
          done();
        });
      });
  });

});
