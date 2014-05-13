
describe('userjoy', function () {

  var userjoy = window.userjoy;
  var assert = dev('assert');

  it('should expose a .VERSION', function () {
    assert(userjoy.VERSION);
  });

});
