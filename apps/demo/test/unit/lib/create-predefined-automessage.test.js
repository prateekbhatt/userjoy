describe('Lib create-predefined-automessage', function () {

  /**
   * Models
   */

  var AutoMessage = require('../../../api/models/AutoMessage');
  var Segment = require('../../../api/models/Segment');


  /**
   * Lib
   */

  var createPredefinedAutomessage = require(
    '../../../api/lib/create-predefined-automessages');



  before(function (done) {
    setupTestDb(done)
  });


  describe('()', function () {

    var aid;
    var creatorId;
    var adminUid;

    before(function () {
      aid = saved.apps.first._id;
      creatorId = saved.apps.first.team[0].accid;
      adminUid = creatorId;
    });

    it('should create Predefined Auto Messages', function (done) {

      async.series([

        function createPredefinedSegments(cb) {
          Segment.createPredefined(aid, adminUid, cb);
        },


        function checkPredefinedAmsgBefore(cb) {
          AutoMessage
            .find({
              aid: aid
            })
            .exec(function (err, amsgs) {

              expect(err)
                .to.not.exist;

              // 2 automessges are created in the fixtures
              expect(amsgs)
                .to.be.an('array')
                .that.has.length(2);
              cb();

            });
        },


        function createPredefinedAmsg(cb) {

          createPredefinedAutomessage(aid, creatorId, cb);

        },


        function checkPredefinedAmsgAfter(cb) {
          AutoMessage
            .find({
              aid: aid
            })
            .exec(function (err, amsgs) {
              expect(err)
                .to.not.exist;

              console.log('amsgs amsgsgafsda', amsgs);

              expect(amsgs)
                .to.be.an('array')
                .has.length(5);

              var title = [];

              for (var i = 0; i < amsgs.length; i++) {
                title[i] = amsgs[i].title;
              };

              console.log("title: ", title);

              _.each(title, function(h) {
                if(_.contains(h, 'Welcome Message') || _.contains(h, 'Message sent after 3 days') || _.contains(h, 'Message sent after 7 days')) {
                  expect(h)
                    .that.is.a('string')
                    .equals(h);

                }

              })



              cb();
            })
        }


      ], done);



    });


  })


});
