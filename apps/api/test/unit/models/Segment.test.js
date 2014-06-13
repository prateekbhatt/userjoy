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
            .to.eql("Invalid filter method type");

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
              type: 'feature'
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
              type: 'feature',
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
            type: 'feature',
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
            type: 'feature',
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
            type: 'feature',
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
            type: 'pageview',
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
            type: 'feature',
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

  });

});
