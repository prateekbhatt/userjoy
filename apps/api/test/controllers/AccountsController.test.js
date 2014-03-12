
describe('GET /accounts', function () {

  it('responds with json', function (done) {

    request
      .get('/accounts')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

});

describe('POST /accounts', function () {

  var demoAccount = {
    firstName: 'Prateek',
    lastName: 'Bhatt',
    email: 'prateek@dodatado.com',
    password: 'testingnewapp'
  },

  newAccount = {
    firstName: 'Prateek',
    lastName: 'Bhatt',
    email: 'prattbhatt@gmail.com',
    password: 'testingnewapp'
  },

  existingEmail = {
    firstName: 'Random',
    lastName: 'User',
    email: 'prateek@dodatado.com',
    password: 'testingnewapp'
  },

  noEmail = {
    firstName: 'Random',
    lastName: 'User',
    password: 'testingnewapp'
  };

  before(function (done) {
    request
      .post('/accounts')
      .send(demoAccount)
      .end(done);
  });

  it('creates new account', function (done) {

    request
      .post('/accounts')
      .send(newAccount)
      .expect('Content-Type', /json/)
      .expect(201, done);

  });

  it('fails to create new account with existing email', function (done) {

    request
      .post('/accounts')
      .send(existingEmail)
      .expect('Content-Type', /json/)
      .expect(500, done);

  });

  // it('fails to save user', function (done) {
  //   // body...
  // });

});
