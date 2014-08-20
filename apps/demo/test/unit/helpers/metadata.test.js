describe('Helper metadata', function () {

  var metadata = require('../../../helpers/metadata');

  var exMetadata = {
    status: 'pending',
    tries: 991
  };

  var expectedOutput = [{
    k: 'status',
    v: 'pending'
  }, {
    k: 'tries',
    v: 991
  }];

  describe('#toArray', function () {

    it('should return an array of key-value pairs', function () {
      var a = metadata.toArray(exMetadata);
      expect(a)
        .to.eql(expectedOutput);
    });


    it('should return empty array if no input', function () {
      expect(metadata.toArray())
        .to.eql([]);
    });

  });


  describe('#toObject', function () {

    it('should return an object with key-value pairs', function () {

      var a = metadata.toObject(expectedOutput);
      expect(a)
        .to.be.an('object')
        .that.deep.equals(exMetadata);

    });


    it('should return empty object if no input', function () {
      expect(metadata.toObject())
        .to.eql({});
    });

  });


});
