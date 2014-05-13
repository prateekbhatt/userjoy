describe('UserJoy', function () {

  var userjoy = window.userjoy;
  var require = userjoy.require;
  var UserJoy = require('./userjoy');
  var assert = dev('assert');
  var bind = require('event')
    .bind;
  var cookie = require('./cookie');
  var company = require('./company');
  var is = require('is');
  var jQuery = dev('jquery');
  var queue = require('./queue');
  var sinon = dev('sinon');
  var store = require('./store');
  var tick = dev('next-tick');
  var trigger = dev('trigger-event');
  var user = require('./user');

  var userjoy;
  var Test;
  var settings = {
    Test: {
      key: 'key'
    }
  };

  beforeEach(function () {
    userjoy = new UserJoy();
    userjoy.timeout(0);
  });

  afterEach(function () {
    user.reset();
    company.reset();
  });


  it('should set a default timeout', function () {
    userjoy = new UserJoy();
    assert(300 === userjoy._timeout);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.spy(user, 'load');
      sinon.spy(company, 'load');
      sinon.spy(userjoy, '_invokeQueue');
      sinon.spy(userjoy, 'page');
    });

    afterEach(function () {
      user.load.restore();
      company.load.restore();
      userjoy._invokeQueue.restore();
      userjoy.page.restore();
    });

    it('should not error without settings', function () {
      userjoy.initialize();
    });

    it('should set options', function () {
      userjoy._options = sinon.spy();
      userjoy.initialize({}, {
        option: true
      });
      assert(userjoy._options.calledWith({
        option: true
      }));
    });

    it('should call #_invokeQueue', function () {
      userjoy.initialize();
      assert(userjoy._invokeQueue.calledOnce);
    });

    it('should call #load on the user', function () {
      userjoy.initialize();
      assert(user.load.called);
    });

    it('should call #load on the company', function () {
      userjoy.initialize();
      assert(company.load.called);
    });

    it('should invoke #page', function () {
      userjoy.initialize();
      assert(userjoy.page.calledOnce);
    });

  });

  describe('#_invokeQueue', function () {

    beforeEach(function () {
      sinon.stub(userjoy, 'push');
      queue.tasks = [
        ['identify', 'prateek'],
        ['track', 'page', '/about']
      ];
      userjoy._invokeQueue();
    });

    afterEach(function () {
      userjoy.push.restore();
    });

    it('should call #_push for each task', function () {
      assert(userjoy.push.calledTwice);
    });

    it('should remove invoked tasks from the queue', function () {
      assert.equal(queue.tasks.length, 0);
    });

    it('should invoke tasks beginning from the start of the queue',
      function () {
        assert(userjoy.push.firstCall.calledWith(['identify', 'prateek']));
      });

  });

  describe('#_send', function () {
    beforeEach(function (done) {
      userjoy.initialize();
    });

  });

  describe('#_options', function () {
    beforeEach(function () {
      sinon.stub(cookie, 'options');
      sinon.stub(store, 'options');
      sinon.stub(user, 'options');
      sinon.stub(company, 'options');
    });

    afterEach(function () {
      cookie.options.restore();
      store.options.restore();
      user.options.restore();
      company.options.restore();
    });

    it('should set cookie options', function () {
      userjoy._options({
        cookie: {
          option: true
        }
      });
      assert(cookie.options.calledWith({
        option: true
      }));
    });

    it('should set store options', function () {
      userjoy._options({
        localStorage: {
          option: true
        }
      });
      assert(store.options.calledWith({
        option: true
      }));
    });

    it('should set user options', function () {
      userjoy._options({
        user: {
          option: true
        }
      });
      assert(user.options.calledWith({
        option: true
      }));
    });

    it('should set company options', function () {
      userjoy._options({
        company: {
          option: true
        }
      });
      assert(company.options.calledWith({
        option: true
      }));
    });
  });

  describe('#_timeout', function () {
    it('should set the timeout for callbacks', function () {
      userjoy.timeout(500);
      assert(500 === userjoy._timeout);
    });
  });

  describe('#_callback', function () {
    it('should callback after a timeout', function (done) {
      var spy = sinon.spy();
      userjoy._callback(spy);
      assert(!spy.called);
      tick(function () {
        assert(spy.called);
        done();
      });
    });
  });

  describe('#page', function () {
    var defaults;

    beforeEach(function () {
      defaults = {
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title,
        url: window.location.href,
        search: window.location.search
      };
      sinon.spy(userjoy, '_send');
    });

    // it('should call #_send', function () {
    //   userjoy.page();
    //   assert(userjoy._send.calledWith('page'));
    // });

    it('should call #_send with type "page" and params', function () {
      userjoy.page();
      var page = userjoy._send.args[0];
      assert(page[0] === 'page');
      assert(page[1] instanceof Object);
    })

    it('should accept (category, name, properties, options, callback)',
      function (done) {
        defaults.category = 'category';
        defaults.name = 'name';
        userjoy.page('category', 'name', {}, {}, function () {
          var page = userjoy._send.args[0][1];
          assert('category' == page.category);
          assert('name' == page.name);
          assert('object' == typeof page.properties);
          assert('object' == typeof page.options);
          done();
        });
      });

    it('should accept (category, name, properties, callback)', function (
      done) {
      defaults.category = 'category';
      defaults.name = 'name';
      userjoy.page('category', 'name', {}, function () {
        var page = userjoy._send.args[0][1];
        assert('category' == page.category);
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        done();
      });
    });

    it('should accept (category, name, callback)', function (done) {
      defaults.category = 'category';
      defaults.name = 'name';
      userjoy.page('category', 'name', function () {
        var page = userjoy._send.args[0][1];
        assert('category' == page.category);
        assert('name' == page.name);
        done();
      });
    });

    it('should accept (name, properties, options, callback)', function (
      done) {
      defaults.name = 'name';
      userjoy.page('name', {}, {}, function () {
        var page = userjoy._send.args[0][1];
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should accept (name, properties, callback)', function (done) {
      defaults.name = 'name';
      userjoy.page('name', {}, function () {
        var page = userjoy._send.args[0][1];
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        done();
      });
    });

    it('should accept (name, callback)', function (done) {
      defaults.name = 'name';
      userjoy.page('name', function () {
        var page = userjoy._send.args[0][1];
        assert('name' == page.name);
        done();
      });
    });

    it('should accept (properties, options, callback)', function (done) {
      userjoy.page({}, {}, function () {
        var page = userjoy._send.args[0][1];
        assert(null == page.category);
        assert(null == page.name);
        assert('object' == typeof page.properties);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should accept (properties, callback)', function (done) {
      userjoy.page({}, function () {
        var page = userjoy._send.args[0][1];
        assert(null == page.category);
        assert(null == page.name);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should back properties with defaults', function () {
      defaults.property = true;
      userjoy.page({
        property: true
      });
      var page = userjoy._send.args[0][1];
      assert.deepEqual(defaults, page.properties);
    });

  });

  describe('#identify', function () {
    beforeEach(function () {
      sinon.spy(user, 'identify');
    });

    afterEach(function () {
      user.identify.restore();
    });

    it('should accept (id, traits, options, callback)', function (
      done) {
      // NOTE: this test is not complete
      userjoy.identify('id', {
        trait: true
      }, {}, function () {
        assert(user.identify.calledWith('id', {
          trait: true
        }));
        done();
      });
    });

    it('should accept (id, traits, callback)', function (done) {
      userjoy.identify('id', {
        trait: true
      }, function () {
        assert(user.identify.calledWith('id', {
          trait: true
        }));
        done();
      });
    });

    it('should accept (id, callback)', function (done) {
      userjoy.identify('id', function () {
        assert(user.identify.calledWith('id'));
        done();
      });
    });

    it('should accept (traits, options, callback)', function (done) {
      // NOTE: this test is not complete
      userjoy.identify({
        trait: true
      }, {}, function () {
        assert(user.identify.calledWith(null, {
          trait: true
        }));
        done();
      });
    });

    it('should accept (traits, callback)', function (done) {
      // NOTE: this test is not complete
      userjoy.identify({
        trait: true
      }, function () {
        assert(user.identify.calledWith(null, {
          trait: true
        }));
        done();
      });
    });

    it('should identify the user', function () {
      userjoy.identify('id', {
        trait: true
      });
      assert(user.identify.calledWith('id', {
        trait: true
      }));
    });

    it('should reset/overwrite stored traits', function () {
      user.traits({
        one: 1
      });
      user.save();
      userjoy.identify('id', {
        two: 2
      });
      assert(1 == user.traits()
        .one);
      assert(2 == user.traits()
        .two);
    });

    // it('should parse a created string into a date', function () {
    //   var date = new Date();
    //   var string = date.getTime().toString();
    //   userjoy.identify({ created: string });
    //   var created = userjoy._send.args[0][1].created();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   userjoy.identify({ created: milliseconds });
    //   var created = userjoy._send.args[0][1].created();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   userjoy.identify({ created: seconds });
    //   var identify = userjoy._send.args[0][1];
    //   var created = identify.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });

    // it('should parse a company created string into a date', function () {
    //   var date = new Date();
    //   var string = date.getTime() + '';
    //   userjoy.identify({ company: { created: string }});
    //   var identify = userjoy._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse company created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   userjoy.identify({ company: { created: milliseconds }});
    //   var identify = userjoy._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse company created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   userjoy.identify({
    //     company: {
    //       created: seconds
    //     }
    //   });
    //   var identify = userjoy._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });
  });

  describe('#user', function () {
    it('should return the user singleton', function () {
      assert(userjoy.user() == user);
    });
  });

  describe('#company', function () {
    beforeEach(function () {
      sinon.spy(userjoy, '_send');
      sinon.spy(company, 'identify');
    });

    afterEach(function () {
      company.identify.restore();
    });

    it('should return the company singleton', function () {
      assert(userjoy.company() == company);
    });

    it('should accept (id, properties, options, callback)', function (
      done) {
      userjoy.company('id', {
        trait: true
      }, {}, function () {
        company.identify.calledWith('id', {
          trait: true
        });
        done();
      });
    });

    it('should accept (id, properties, callback)', function (done) {
      userjoy.company('id', {
        trait: true
      }, function () {
        company.identify.calledWith('id', {
          trait: true
        });
        done();
      });
    });

    it('should accept (id, callback)', function (done) {
      userjoy.company('id', function () {
        company.identify.calledWith('id');
        done();
      });
    });

    it('should accept (properties, options, callback)', function (
      done) {
      userjoy.company({
        trait: true
      }, {}, function () {
        company.identify.calledWith(null, {
          trait: true
        });
        done();
      });
    });

    it('should accept (properties, callback)', function (done) {
      userjoy.company({
        trait: true
      }, function () {
        company.identify.calledWith(null, {
          trait: true
        });
        done();
      });
    });

    it('should call #identify on the company', function () {
      userjoy.company('id', {
        property: true
      });
      assert(company.identify.calledWith('id', {
        property: true
      }));
    });

    it('should back properties with stored properties', function () {
      company.properties({
        one: 1
      });
      company.save();
      userjoy.company('id', {
        two: 2
      });
      assert('id' == company.id());
      assert(1 == company.properties()
        .one);
      assert(2 == company.properties()
        .two);
    });

    // it('should parse a created string into a date', function () {
    //   var date = new Date();
    //   var string = date.getTime().toString();
    //   userjoy.company({ created: string });
    //   var g = userjoy._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   userjoy.company({ created: milliseconds });
    //   var g = userjoy._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   userjoy.company({ created: seconds });
    //   var g = userjoy._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });
  });

  describe('#track', function () {
    beforeEach(function () {
      sinon.spy(userjoy, '_send');
    });

    it('should call #_send', function () {
      userjoy.track();
      assert(userjoy._send.calledWith('track'));
    });

    it('should accept (event, properties, options, callback)', function (
      done) {
      userjoy.track('event', {}, {}, function () {
        var track = userjoy._send.args[0][1];
        assert('event' == track.event);
        assert('object' == typeof track.properties);
        assert('object' == typeof track.options);
        done();
      });
    });

    it('should accept (event, properties, callback)', function (done) {
      userjoy.track('event', {}, function () {
        var track = userjoy._send.args[0][1];
        assert('event' == track.event);
        assert('object' == typeof track.properties);
        done();
      });
    });

    it('should accept (event, callback)', function (done) {
      userjoy.track('event', function () {
        var track = userjoy._send.args[0][1];
        assert('event' == track.event);
        done();
      });
    });

    // it('should safely convert ISO dates to date objects', function () {
    //   var date = new Date(Date.UTC(2013, 9, 5));
    //   userjoy.track('event', {
    //     date: '2013-10-05T00:00:00.000Z',
    //     nonDate: '2013'
    //   });
    //   var track = userjoy._send.args[0][1];
    //   assert(track.properties()
    //     .date.getTime() === date.getTime());
    //   assert(track.properties()
    //     .nonDate === '2013');
    // });
  });

  describe('#trackLink', function () {
    var link;

    beforeEach(function () {
      sinon.spy(userjoy, 'track');
      link = document.createElement('a');
    });

    afterEach(function () {
      window.location.hash = '';
    });

    it('should trigger a track on an element click', function () {
      userjoy.trackLink(link);
      trigger(link, 'click');
      assert(userjoy.track.called);
    });

    it('should accept a jquery object for an element', function () {
      var $link = jQuery(link);
      userjoy.trackLink($link);
      trigger(link, 'click');
      assert(userjoy.track.called);
    });

    it('should send an event and properties', function () {
      userjoy.trackLink(link, 'event', {
        property: true
      });
      trigger(link, 'click');
      assert(userjoy.track.calledWith('event', {
        property: true
      }));
    });

    it('should accept an event function', function () {
      function event(el) {
        return el.nodeName;
      }
      userjoy.trackLink(link, event);
      trigger(link, 'click');
      assert(userjoy.track.calledWith('A'));
    });

    it('should accept a properties function', function () {
      function properties(el) {
        return {
          type: el.nodeName
        };
      }
      userjoy.trackLink(link, 'event', properties);
      trigger(link, 'click');
      assert(userjoy.track.calledWith('event', {
        type: 'A'
      }));
    });

    it('should load an href on click', function (done) {
      link.href = '#test';
      userjoy.trackLink(link);
      trigger(link, 'click');
      tick(function () {
        assert(window.location.hash == '#test');
        done();
      });
    });

    it('should not load an href for a link with a blank target', function (
      done) {
      link.href = '/test/server/mock.html';
      link.target = '_blank';
      userjoy.trackLink(link);
      trigger(link, 'click');
      tick(function () {
        assert(window.location.hash != '#test');
        done();
      });
    });
  });

  describe('#trackForm', function () {
    var form, submit;

    before(function () {
      window.jQuery = jQuery;
    });

    after(function () {
      delete window.jQuery;
    });

    beforeEach(function () {
      sinon.spy(userjoy, 'track');
      form = document.createElement('form');
      form.action = '/test/server/mock.html';
      form.target = '_blank';
      submit = document.createElement('input');
      submit.type = 'submit';
      form.appendChild(submit);
    });

    afterEach(function () {
      window.location.hash = '';
    });

    it('should trigger a track on a form submit', function () {
      userjoy.trackForm(form);
      trigger(submit, 'click');
      assert(userjoy.track.called);
    });

    it('should accept a jquery object for an element', function () {
      var $form = jQuery(form);
      userjoy.trackForm(form);
      trigger(submit, 'click');
      assert(userjoy.track.called);
    });

    it('should send an event and properties', function () {
      userjoy.trackForm(form, 'event', {
        property: true
      });
      trigger(submit, 'click');
      assert(userjoy.track.calledWith('event', {
        property: true
      }));
    });

    it('should accept an event function', function () {
      function event(el) {
        return 'event';
      }
      userjoy.trackForm(form, event);
      trigger(submit, 'click');
      assert(userjoy.track.calledWith('event'));
    });

    it('should accept a properties function', function () {
      function properties(el) {
        return {
          property: true
        };
      }
      userjoy.trackForm(form, 'event', properties);
      trigger(submit, 'click');
      assert(userjoy.track.calledWith('event', {
        property: true
      }));
    });

    it('should call submit after a timeout', function (done) {
      var spy = sinon.spy(form, 'submit');
      userjoy.trackForm(form);
      trigger(submit, 'click');
      setTimeout(function () {
        assert(spy.called);
        done();
      });
    });

    it('should trigger an existing submit handler', function (done) {
      bind(form, 'submit', function () {
        done();
      });
      userjoy.trackForm(form);
      trigger(submit, 'click');
    });

    it('should trigger an existing jquery submit handler', function (done) {
      var $form = jQuery(form);
      $form.submit(function () {
        done();
      });
      userjoy.trackForm(form);
      trigger(submit, 'click');
    });

    it('should track on a form submitted via jquery', function () {
      var $form = jQuery(form);
      userjoy.trackForm(form);
      $form.submit();
      assert(userjoy.track.called);
    });

    it(
      'should trigger an existing jquery submit handler on a form submitted via jquery',
      function (done) {
        var $form = jQuery(form);
        $form.submit(function () {
          done();
        });
        userjoy.trackForm(form);
        $form.submit();
      });
  });

  describe('#push', function () {
    beforeEach(function () {
      userjoy.track = sinon.spy();
    })

    it('should call methods with args', function () {
      userjoy.push(['track', 'event', {
        prop: true
      }]);
      assert(userjoy.track.calledWith('event', {
        prop: true
      }));
    })
  })

});
