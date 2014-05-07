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

  it('should return an array of key-value pairs', function () {
    var a = metadata.format(exMetadata);
    expect(a)
      .to.eql(expectedOutput);
  });


  it('should return empty array if no input', function () {
    expect(metadata.format())
      .to.eql([]);
  });

});
