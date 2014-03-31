
describe('company', function () {

  var dodatado = window.dodatado;
  var require = dodatado.require;
  var assert = dev('assert');
  var cookie = require('./cookie');
  var equal = dev('equals');
  var json = require('json');
  var store = require('./store');
  var company = require('./company');
  var Company = company.Company;

  var cookieKey = company._options.cookie.key;
  var localStorageKey = company._options.localStorage.key;

  before(function () {
    company.reset();
  });

  afterEach(function () {
    company.reset();
    cookie.remove(cookieKey);
    store.remove(localStorageKey);
  });

  describe('()', function(){
    beforeEach(function(){
      cookie.set(cookieKey, 'gid');
      store.set(localStorageKey, { trait: true });
    })

    it('should not reset company id and traits', function(){
      var company = new Company;
      assert('gid' == company.id());
      assert(true == company.traits().trait);
    })
  })

  describe('#id', function () {
    it('should get an id from the cookie', function () {
      cookie.set(cookieKey, 'id');
      assert('id' == company.id());
    });

    it('should get an id when not persisting', function () {
      company.options({ persist: false });
      company._id = 'id';
      assert('id' == company.id());
    });

    it('should set an id to the cookie', function () {
      company.id('id');
      assert('id' === cookie.get(cookieKey));
    });

    it('should set the id when not persisting', function () {
      company.options({ persist: false });
      company.id('id');
      assert('id' == company._id);
    });

    it('should be null by default', function () {
      assert(null === company.id());
    });
  });

  describe('#properties', function () {
    it('should get properties', function () {
      store.set(localStorageKey, { property: true });
      assert(equal({ property: true }, company.properties()));
    });

    it('should get a copy of properties', function () {
      store.set(localStorageKey, { property: true });
      assert(company._traits != company.properties());
    });

    it('should get properties when not persisting', function () {
      company.options({ persist: false });
      company._traits = { property: true };
      assert(equal({ property: true }, company.properties()));
    });

    it('should get a copy of properties when not persisting', function () {
      company.options({ persist: false });
      company._traits = { property: true };
      assert(company._traits != company.properties());
    });

    it('should set properties', function () {
      company.properties({ property: true });
      assert(equal({ property: true }, store.get(localStorageKey)));
    });

    it('should set the id when not persisting', function () {
      company.options({ persist: false });
      company.properties({ property: true });
      assert(equal({ property: true }, company._traits));
    });

    it('should default properties to an empty object', function () {
      company.properties(null);
      assert(equal({}, store.get(localStorageKey)));
    });

    it('should default properties to an empty object when not persisting', function () {
      company.options({ persist: false });
      company.properties(null);
      assert(equal({}, company._traits));
    });

    it('should be an empty object by default', function () {
      assert(equal({}, company.properties()));
    });
  });

  describe('#options', function () {
    it('should get options', function () {
      var options = company.options();
      assert(options ==  company._options);
    });

    it('should set options with defaults', function () {
      company.options({ option: true });
      assert(equal(company._options, {
        option: true,
        persist: true,
        cookie: {
          key: 'dodatado_company_id'
        },
        localStorage: {
          key: 'dodatado_company_properties'
        }
      }));
    });
  });

  describe('#save', function () {
    it('should save an id to a cookie', function () {
      company.id('id');
      company.save();
      assert('id' == cookie.get(cookieKey));
    });

    it('should save properties to local storage', function () {
      company.properties({ property: true });
      company.save();
      assert(equal({ property: true }, store.get(localStorageKey)));
    });

    it('shouldnt save if persist is false', function () {
      company.options({ persist: false });
      company.id('id');
      company.save();
      assert(null === cookie.get(cookieKey));
    });
  });

  describe('#logout', function () {
    it('should reset an id and properties', function () {
      company.id('id');
      company.properties({ property: true });
      company.logout();
      assert(null === company.id());
      assert(equal({}, company.properties()));
    });

    it('should clear a cookie', function () {
      company.id('id');
      company.save();
      company.logout();
      assert(null === cookie.get(cookieKey));
    });

    it('should clear local storage', function () {
      company.properties({ property: true });
      company.save();
      company.logout();
      assert(undefined === store.get(localStorageKey));
    });
  });

  describe('#identify', function () {
    it('should save an id', function () {
      company.identify('id');
      assert('id' == company.id());
      assert('id' == cookie.get(cookieKey));
    });

    it('should save properties', function () {
      company.identify(null, { property: true });
      assert(equal({ property: true }, company.properties()));
      assert(equal({ property: true }, store.get(localStorageKey)));
    });

    it('should save an id and properties', function () {
      company.identify('id', { property: true });
      assert('id' == company.id());
      assert(equal({ property: true }, company.properties()));
      assert('id' == cookie.get(cookieKey));
      assert(equal({ property: true }, store.get(localStorageKey)));
    });

    it('should extend existing properties', function () {
      company.properties({ one: 1 });
      company.identify('id', { two: 2 });
      assert(equal({ one: 1, two: 2 }, company.properties()));
      assert(equal({ one: 1, two: 2 }, store.get(localStorageKey)));
    });

    it('shouldnt extend existing properties for a new id', function () {
      company.id('id');
      company.properties({ one: 1 });
      company.identify('new', { two: 2 });
      assert(equal({ two: 2 }, company.properties()));
      assert(equal({ two: 2 }, store.get(localStorageKey)));
    });

    it('should reset properties for a new id', function () {
      company.id('id');
      company.properties({ one: 1 });
      company.identify('new');
      assert(equal({}, company.properties()));
      assert(equal({}, store.get(localStorageKey)));
    });
  });

  describe('#load', function () {
    it('should load an empty company', function () {
      company.load();
      assert(null === company.id());
      assert(equal({}, company.properties()));
    });

    it('should load an id from a cookie', function () {
      cookie.set(cookieKey, 'id');
      company.load();
      assert('id' == company.id());
    });

    it('should load properties from local storage', function () {
      store.set(localStorageKey, { property: true });
      company.load();
      assert(equal({ property: true }, company.properties()));
    });
  });

});
