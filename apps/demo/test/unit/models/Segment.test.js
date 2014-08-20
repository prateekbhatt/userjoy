describe('Model Segment', function () {


  /**
   * Models
   */

  var Segment = require('../../../api/models/Segment');


  /**
   * Test variables
   */

  var randomId = '532d6bf862d673ba7131812a';
  var savedSegment;


  before(function (done) {
    setupTestDb(done);
  });


  describe('#create', function () {


    it('should return error if aid/creator/list/name/op not provided',
      function (done) {

        var newSegment = {};

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.exist;

          expect(Object.keys(err.errors)
            .length)
            .to.eql(5);

          expect(err.errors.aid.message)
            .to.eql('Invalid aid');

          expect(err.errors.creator.message)
            .to.eql('Invalid creator account id');

          expect(err.errors.list.message)
            .to.eql('Invalid list');

          expect(err.errors.name.message)
            .to.eql('Invalid segment name');

          expect(err.errors.op.message)
            .to.eql('Invalid operator');

          expect(seg)
            .not.to.exist;

          done();
        });
      });


    it('should return error if no filters are provided', function (done) {

      var newSegment = {
        aid: randomId,
        creator: randomId,
        list: 'users',
        name: 'New Segment',
        op: 'and'
      };

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.exist;

        expect(err)
          .to.have.property("message",
            "Provide atleast one segment filter");

        expect(seg)
          .not.to.exist;
        done();
      });

    });



    it('should return error if filter method/name not provided',
      function (done) {

        var newSegment = {
          aid: randomId,
          creator: randomId,
          list: 'users',
          name: 'New Segment',
          op: 'and',
          filters: [

            {
              val: 'hello'
            }

          ]
        };


        Segment.create(newSegment, function (err, seg) {

          expect(Object.keys(err.errors)
            .length)
            .to.eql(2);

          expect(err.errors['filters.0.method'].message)
            .to.eql('Filter method is required');

          expect(err.errors['filters.0.name'].message)
            .to.eql('Name is required in segment filter');

          expect(seg)
            .not.to.exist;

          done();
        });


      });


    it('should return error if invalid filter type provided',
      function (done) {

        var newSegment = {
          aid: randomId,
          creator: randomId,
          list: 'users',
          name: 'New Segment',
          op: 'and',
          filters: [

            {
              method: 'count',
              name: 'Create Notification',
              type: 'random',
              val: 'hello'
            }

          ]
        };


        Segment.create(newSegment, function (err, seg) {

          expect(Object.keys(err.errors)
            .length)
            .to.eql(1);

          expect(err.errors['filters.0.type'].message)
            .to.eql(
              "Event type must be one of 'auto/form/link/page/track'");

          expect(seg)
            .not.to.exist;

          done();
        });


      });


    it(
      'should return error if for count method filter, val/op not provided',
      function (done) {

        var newSegment = {
          aid: randomId,
          creator: randomId,
          list: 'users',
          name: 'New Segment',
          op: 'and',
          filters: [

            {
              method: 'count',
              name: 'Create Notification',
              type: 'track'
            }

          ]
        };


        Segment.create(newSegment, function (err, seg) {

          expect(err.message)
            .to.eql('Provide valid filter operator and filter value');

          expect(seg)
            .not.to.exist;

          done();
        });


      });


    it(
      'should create segment if for count method filter, val is 0',
      function (done) {

        var newSegment = {
          aid: randomId,
          creator: randomId,
          list: 'users',
          name: 'New Segment',
          op: 'and',
          filters: [

            {
              method: 'count',
              name: 'Create Notification',
              type: 'track',
              op: 'eq',
              val: 0
            }

          ]
        };


        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.not.exist;

          expect(seg.aid.toString())
            .eql(newSegment.aid);

          done();
        });


      });


    it('should return error if fromAgo < 1 and toAgo < 0', function (done) {

      var newSegment = {
        aid: randomId,
        creator: randomId,
        list: 'users',
        name: 'New Segment',
        op: 'and',
        fromAgo: 0,
        toAgo: -1,
        filters: [

          {
            method: 'hasdone',
            type: 'track',
            name: 'Create Notification'
          }

        ]
      };

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.exist;

        expect(Object.keys(err.errors))
          .to.contain('toAgo');

        expect(Object.keys(err.errors))
          .to.contain('fromAgo');

        expect(seg)
          .to.not.exist;

        done();
      });

    });


    it('should return error if fromAgo < toAgo', function (done) {

      var newSegment = {
        aid: randomId,
        creator: randomId,
        list: 'users',
        name: 'New Segment',
        op: 'and',
        fromAgo: 10,
        toAgo: 11,
        filters: [

          {
            method: 'hasdone',
            type: 'track',
            name: 'Create Notification'
          }

        ]
      };

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.exist;

        expect(err.message)
          .to.eql('fromAgo must be greater than toAgo');

        expect(seg)
          .to.not.exist;

        done();
      });

    });


    it('should create new segment', function (done) {

      var newSegment = {
        aid: randomId,
        creator: randomId,
        list: 'users',
        name: 'New Segment',
        op: 'and',
        fromAgo: 3,
        toAgo: 1,
        filters: [

          {
            method: 'hasdone',
            type: 'track',
            name: 'Create Notification'
          }

        ]
      };

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.not.exist;

        expect(seg)
          .to.be.an('object');

        expect(seg.fromAgo)
          .to.eql(newSegment.fromAgo);

        expect(seg.toAgo)
          .to.eql(newSegment.toAgo);

        savedSegment = seg;

        done();
      });

    });

    it('should add ct (created) timestamp to new segment', function () {
      expect(savedSegment)
        .to.have.property('ct');
    });

    it('should add ut (updated) timestamp to new segment',
      function () {
        expect(savedSegment)
          .to.have.property('ut');
      });



    it('should add predefined status to false',
      function () {
        expect(savedSegment)
          .to.have.property('predefined')
          .that.is.false;
      });

    it('should add filters array to new segment',
      function () {

        expect(savedSegment)
          .to.have.property('filters');

        expect(savedSegment.filters)
          .to.be.an('array');

        expect(savedSegment.filters)
          .to.have.length(1);

      });

    it('should return error if list is not in [users, companies]',
      function (done) {

        var newSegment = {
          aid: randomId,
          list: 'random',
          op: 'and'
        };

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.exist;

          expect(seg)
            .not.to.exist;

          expect(err.errors.list.message)
            .to.eql(
              '`random` is not a valid enum value for path `list`.');

          done();
        });

      });


    it('should return error if op is not in [and, or]',
      function (done) {

        var newSegment = {
          aid: randomId,
          list: 'companies',
          op: 'random'
        };

        Segment.create(newSegment, function (err, seg) {
          expect(err)
            .to.exist;

          expect(seg)
            .not.to.exist;

          expect(err.errors.op.message)
            .to.eql(
              '`random` is not a valid enum value for path `op`.');

          done();
        });

      });


    it('should return error if filter method is not present',
      function (
        done) {
        var newSegment = {
          aid: randomId,
          list: 'companies',
          op: 'and',
          filters: [{
            type: 'page',
          }]
        };

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.exist;

          expect(err.errors['filters.0.method'].message)
            .to.eql('Filter method is required');

          done();
        });
      });

    it(
      'should return error if filter method not in [hasdone, hasnotdone, count, attr]',
      function (
        done) {
        var newSegment = {
          aid: randomId,
          list: 'companies',
          op: 'and',
          filters: [{
            method: 'random',
            type: 'track',
            name: 'Create chat'
          }]
        };

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.exist;

          expect(err.errors['filters.0.method'].message)
            .to.eql('Invalid filter method type');

          done();
        });
      });


    it(
      'should return error if for predefined health segment, health is not one of good/average/poor',
      function (done) {

        var newSegment = {
          aid: randomId,
          creator: randomId,
          health: 'randomHealthValShouldReturnError',
          list: 'users',
          name: 'New Segment',
          op: 'and',
          predefined: true,
          fromAgo: 3,
          toAgo: 1,
          filters: [

            {
              method: 'hasdone',
              type: 'track',
              name: 'Create Notification'
            }

          ]
        };

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .to.exist;

          expect(seg)
            .to.not.exist;

          expect(err.errors)
            .to.have.property('health')
            .that.is.an('object')
            .and.has.property('message')
            .that.is.a('string')
            .that.eqls(
              'Health status must be one of \'good\', \'average\' or \'poor\''
          );

          done();
        });

      });



    it('should create predefined health segment', function (done) {

      var newSegment = {
        aid: randomId,
        creator: randomId,
        health: 'good',
        list: 'users',
        name: 'New Segment',
        op: 'and',
        predefined: true,
        fromAgo: 3,
        toAgo: 1,
        filters: [

          {
            method: 'hasdone',
            type: 'track',
            name: 'Create Notification'
          }

        ]
      };

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.not.exist;

        expect(seg)
          .to.be.an('object');

        expect(seg.fromAgo)
          .to.eql(newSegment.fromAgo);

        expect(seg.toAgo)
          .to.eql(newSegment.toAgo);

        expect(seg)
          .to.have.property('predefined')
          .that.is.a('boolean')
          .and.is.true;

        expect(seg)
          .to.have.property('health')
          .that.is.a('string')
          .and.eqls('good');

        done();
      });

    });


  });


  describe('#createPredefined', function () {

    var app;
    var aid;
    var adminUid;

    before(function () {
      app = saved.apps.first;
      aid = app._id;
      adminUid = app.team[0].accid;
    });

    it('should create predefined segments', function (done) {

      Segment.createPredefined(aid, adminUid,
        function (err, good, average, poor, hotTrials, riskUsers,
          signedUp1DayAgo, signedUp3DaysAgo, signedUp7DaysAgo,
          evangelists, upsellOpportunities) {

          expect(err)
            .to.not.exist;

          good = good.toJSON();
          average = average.toJSON();
          poor = poor.toJSON();
          hotTrials = hotTrials.toJSON();
          riskUsers = riskUsers.toJSON();
          signedUp1DayAgo = signedUp1DayAgo.toJSON();
          signedUp3DaysAgo = signedUp3DaysAgo.toJSON();
          signedUp7DaysAgo = signedUp7DaysAgo.toJSON();
          evangelists = evangelists.toJSON();
          upsellOpportunities = upsellOpportunities.toJSON();

          expect(good)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'score',
              op: 'gt',
              val: 67
            }]);



          expect(average)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'score',
              op: 'gt',
              val: 33
            }, {
              method: 'attr',
              name: 'score',
              op: 'lt',
              val: 68
            }]);


          expect(poor)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'score',
              op: 'lt',
              val: 34
            }]);

          expect(hotTrials)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
                method: 'attr',
                name: 'health',
                op: 'eq',
                val: 'good'
              },

              {
                method: 'attr',
                name: 'status',
                op: 'eq',
                val: 'trial'
              }
            ]);

          expect(riskUsers)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
                method: 'attr',
                name: 'health',
                op: 'eq',
                val: 'poor'
              },

              {
                method: 'attr',
                name: 'status',
                op: 'eq',
                val: 'paying'
              }
            ]);

          expect(signedUp1DayAgo)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'joined',
              op: 'lt',
              val: '1'
            }]);

          expect(signedUp3DaysAgo)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'joined',
              op: 'lt',
              val: '3'
            }]);

          expect(signedUp7DaysAgo)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
              method: 'attr',
              name: 'joined',
              op: 'lt',
              val: '7'
            }]);

          expect(evangelists)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
                method: 'attr',
                name: 'status',
                op: 'eq',
                val: 'paying'
              },

              {
                method: 'attr',
                name: 'health',
                op: 'eq',
                val: 'good'
              },

              {
                method: 'attr',
                name: 'joined',
                op: 'gt',
                val: '180'
              }
            ]);

          expect(upsellOpportunities)
            .to.have.property('filters')
            .that.is.an('array')
            .and.deep.equals([{
                method: 'attr',
                name: 'status',
                op: 'eq',
                val: 'paying'
              },

              {
                method: 'attr',
                name: 'health',
                op: 'eq',
                val: 'good'
              }
            ]);


          var hmap = {
            'good': good,
            'average': average,
            'poor': poor,
            'hotTrials': hotTrials,
            'riskUsers': riskUsers,
            'signedUp1DayAgo': signedUp1DayAgo,
            'signedUp3DaysAgo': signedUp3DaysAgo,
            'signedUp7DaysAgo': signedUp7DaysAgo,
            'evangelists': evangelists,
            'upsellOpportunities': upsellOpportunities
          };


          function capitaliseFirstLetter(string) {
            return string.charAt(0)
              .toUpperCase() + string.slice(1);
          }


          _.each(['good', 'average', 'poor', 'hotTrials', 'riskUsers',
              'signedUp1DayAgo', 'signedUp3DaysAgo', 'signedUp7DaysAgo',
              'evangelists', 'upsellOpportunities'],
            function (h) {

              var type = hmap[h];

              if (_.contains(h, 'good') || (_.contains(h,
                'average')) || (_.contains(h, 'poor'))) {
                expect(type)
                  .to.have.property('health')
                  .that.is.a('string')
                  .and.eqls(h);
              }

              expect(type)
                .to.have.property('predefined')
                .that.is.a('boolean')
                .and.eqls(true);

              expect(type.aid.toString())
                .to.eql(aid.toString());

              if (_.contains(h, 'good') || (_.contains(h,
                'average')) || (_.contains(h, 'poor'))) {
                expect(type)
                  .to.have.property('name')
                  .that.is.a('string')
                  .and.eqls(capitaliseFirstLetter(h) + ' Health');
              }


            });


          done();
        })

    });

  });

});
