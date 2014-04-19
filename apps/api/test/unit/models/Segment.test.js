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


    it('should return error if aid, list or op are not present', function (
      done) {

      var newSegment = {};

      Segment.create(newSegment, function (err, seg) {

        expect(err)
          .to.exist;
        expect(err.errors.aid.message)
          .to.eql('Invalid aid');

        expect(err.errors.list.message)
          .to.eql('Invalid list');

        expect(err.errors.op.message)
          .to.eql('Invalid operator');

        expect(seg)
          .not.to.exist;
        done();
      });
    });


    it('should create new segment if aid, list and op are present',
      function (done) {

        var newSegment = {
          aid: randomId,
          list: 'users',
          op: 'and'
        };

        Segment.create(newSegment, function (err, seg) {
          expect(err)
            .to.not.exist;
          expect(seg)
            .to.be.an('object');

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
          .to.be.empty;

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
            .to.eql(
              '`random` is not a valid enum value for path `method`.');

          done();
        });
      });

    it('should add filter if present',
      function (
        done) {
        var newSegment = {
          aid: randomId,
          list: 'companies',
          op: 'and',
          filters: [{
            method: 'hasdone',
            type: 'feature',
            name: 'Create chat'
          }]
        };

        Segment.create(newSegment, function (err, seg) {

          expect(err)
            .not.to.exist;

          expect(seg.filters[0].name)
            .to.eql('Create chat');

          done();
        });
      });

  });

});
