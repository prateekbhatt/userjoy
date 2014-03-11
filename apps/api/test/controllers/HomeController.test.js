var request = require('supertest');

request = request('http://api.do.localhost/');

describe('GET /', function () {

  it('responds with json', function (done) {

    request
      .get('/')
      .expect('Content-Type', /json/)
      .expect('Content-Length', '42')
      .expect(200, done);
  });
});
