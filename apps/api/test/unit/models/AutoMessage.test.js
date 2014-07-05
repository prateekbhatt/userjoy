describe('Model AutoMessage', function () {


  /**
   * Models
   */

  var AutoMessage = require('../../../api/models/AutoMessage');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedAutoMessage;


  before(function (done) {
    setupTestDb(done);
  });


  describe('#create', function () {

    it(
      'should return error if aid/body/creator/sender/sid/title/type is not provided',
      function (done) {

        var newAutoMsg = {};

        AutoMessage.create(newAutoMsg, function (err, amsg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(7);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.body.message)
            .to.eql('Provide automessage body');

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.sender.message)
            .to.eql('Invalid sender account id');

          expect(err.errors.sid.message)
            .to.eql('Invalid segment id');

          expect(err.errors.title.message)
            .to.eql('Provide automessage title');

          expect(err.errors.type.message)
            .to.eql('Provide automessage type');

          expect(amsg)
            .to.not.exist;

          done();
        })

      });


    it('should create automessage', function (done) {

      var newAutoMessage = {
        aid: randomId,
        body: 'Hey, Welkom to CabanaLand!',
        creator: randomId,
        sender: randomId,
        sid: randomId,
        sub: 'Welkom!',
        title: 'Welcome Message',
        type: 'email'
      };

      AutoMessage.create(newAutoMessage, function (err, msg) {

        expect(err)
          .to.not.exist;

        expect(msg)
          .to.be.an('object');

        savedAutoMessage = msg;

        expect(msg.aid.toString())
          .to.eql(newAutoMessage.aid);

        expect(msg.body)
          .to.eql(newAutoMessage.body);

        expect(msg.creator.toString())
          .to.eql(newAutoMessage.creator);

        expect(msg.sender.toString())
          .to.eql(newAutoMessage.sender);

        expect(msg.sub)
          .to.eql(newAutoMessage.sub);

        expect(msg.title)
          .to.eql(newAutoMessage.title);

        expect(msg.type)
          .to.eql(newAutoMessage.type);

        done();
      });

    });

    it('should add ct (created) timestamp', function () {

      expect(savedAutoMessage)
        .to.have.property('ct');

    });


    it('should add ut (updated) timestamp', function () {

      expect(savedAutoMessage)
        .to.have.property('ut');

    });


    it('should set active status to false by default', function () {
      expect(savedAutoMessage)
        .to.have.property('active', false);
    });


    it('should set clicked/replied/seen/sent values as 0', function () {

      expect(savedAutoMessage.clicked)
        .to.eql(0);

      expect(savedAutoMessage.replied)
        .to.eql(0);

      expect(savedAutoMessage.seen)
        .to.eql(0);

      expect(savedAutoMessage.sent)
        .to.eql(0);

    });

  });


  describe('#updateLastQueued', function () {

    it('should should update lastQueued to current time', function (done) {

      var savedAutoMessage = saved.automessages.first;

      expect(savedAutoMessage)
        .to.not.have.property('lastQueued');

      AutoMessage.updateLastQueued(savedAutoMessage._id,
        function (err, msg) {

          expect(err)
            .to.not.exist;

          expect(msg)
            .to.be.an('object');

          expect(msg)
            .to.have.property("lastQueued");

          expect(msg.lastQueued)
            .to.be.a("date");

          done();
        });

    });

  });


  describe('#incrementCount', function () {

    it('should return error if type not one of clicked/sent/replied/seen ',
      function (done) {

        var savedAutoMessage = saved.automessages.first;
        var type = 'randomType';

        AutoMessage.incrementCount(savedAutoMessage._id, type,
          function (err) {

            expect(err)
              .to.exist;

            expect(err.message)
              .to.eql(
                'AutoMessage event type must be one of sent/seen/clicked/replied'
            );

            done();

          });

      });


    it('should increment count of clicked/sent/replied/seen',
      function (done) {

        var savedAutoMessage = saved.automessages.first;

        async.series(

          [

            function incrementClicked(cb) {

              expect(savedAutoMessage.clicked)
                .to.eql(0);

              AutoMessage.incrementCount(savedAutoMessage._id, 'clicked',
                function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.clicked)
                    .to.eql(1);

                  cb();

                });

            },


            function incrementSeen(cb) {

              expect(savedAutoMessage.seen)
                .to.eql(0);

              AutoMessage.incrementCount(savedAutoMessage._id, 'seen',
                function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.seen)
                    .to.eql(1);

                  cb();

                });

            },


            function incrementSent(cb) {

              expect(savedAutoMessage.sent)
                .to.eql(0);

              AutoMessage.incrementCount(savedAutoMessage._id, 'sent',
                function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.sent)
                    .to.eql(1);

                  cb();

                });

            },


            function incrementReplied(cb) {

              expect(savedAutoMessage.replied)
                .to.eql(0);

              AutoMessage.incrementCount(savedAutoMessage._id, 'replied',
                function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.replied)
                    .to.eql(1);

                  cb();

                });

            }

          ],

          done

        )

      });

  });



});
