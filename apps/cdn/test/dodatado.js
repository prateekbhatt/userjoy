describe('DoDataDo', function () {

  var dodatado = window.dodatado;
  var require = dodatado.require;
  var DoDataDo = require('./dodatado');
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

  var dodatado;
  var Test;
  var settings = {
    Test: {
      key: 'key'
    }
  };

  beforeEach(function () {
    dodatado = new DoDataDo();
    dodatado.timeout(0);
  });

  afterEach(function () {
    user.reset();
    company.reset();
  });


  it('should set a default timeout', function () {
    dodatado = new DoDataDo();
    assert(300 === dodatado._timeout);
  });

  describe('#initialize', function () {
    beforeEach(function () {
      sinon.spy(user, 'load');
      sinon.spy(company, 'load');
      sinon.spy(dodatado, '_invokeQueue');
      sinon.spy(dodatado, 'page');
    });

    afterEach(function () {
      user.load.restore();
      company.load.restore();
      dodatado._invokeQueue.restore();
      dodatado.page.restore();
    });

    it('should not error without settings', function () {
      dodatado.initialize();
    });

    it('should set options', function () {
      dodatado._options = sinon.spy();
      dodatado.initialize({}, {
        option: true
      });
      assert(dodatado._options.calledWith({
        option: true
      }));
    });

    it('should call #_invokeQueue', function () {
      dodatado.initialize();
      assert(dodatado._invokeQueue.calledOnce);
    });

    it('should call #load on the user', function () {
      dodatado.initialize();
      assert(user.load.called);
    });

    it('should call #load on the company', function () {
      dodatado.initialize();
      assert(company.load.called);
    });

    it('should invoke #page', function () {
      dodatado.initialize();
      assert(dodatado.page.calledOnce);
    });

  });

  describe('#_invokeQueue', function () {

    beforeEach(function () {
      sinon.stub(dodatado, 'push');
      queue.tasks = [
        ['identify', 'prateek'],
        ['track', 'page', '/about']
      ];
      dodatado._invokeQueue();
    });

    afterEach(function () {
      dodatado.push.restore();
    });

    it('should call #_push for each task', function () {
      assert(dodatado.push.calledTwice);
    });

    it('should remove invoked tasks from the queue', function () {
      assert.equal(queue.tasks.length, 0);
    });

    it('should invoke tasks beginning from the start of the queue',
      function () {
        assert(dodatado.push.firstCall.calledWith(['identify', 'prateek']));
      });

  });

  describe('#_send', function () {
    beforeEach(function (done) {
      dodatado.initialize();
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
      dodatado._options({
        cookie: {
          option: true
        }
      });
      assert(cookie.options.calledWith({
        option: true
      }));
    });

    it('should set store options', function () {
      dodatado._options({
        localStorage: {
          option: true
        }
      });
      assert(store.options.calledWith({
        option: true
      }));
    });

    it('should set user options', function () {
      dodatado._options({
        user: {
          option: true
        }
      });
      assert(user.options.calledWith({
        option: true
      }));
    });

    it('should set company options', function () {
      dodatado._options({
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
      dodatado.timeout(500);
      assert(500 === dodatado._timeout);
    });
  });

  describe('#_callback', function () {
    it('should callback after a timeout', function (done) {
      var spy = sinon.spy();
      dodatado._callback(spy);
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
      sinon.spy(dodatado, '_send');
    });

    // it('should call #_send', function () {
    //   dodatado.page();
    //   assert(dodatado._send.calledWith('page'));
    // });

    it('should call #_send with type "page" and params', function () {
      dodatado.page();
      var page = dodatado._send.args[0];
      assert(page[0] === 'page');
      assert(page[1] instanceof Object);
    })

    it('should accept (category, name, properties, options, callback)',
      function (done) {
        defaults.category = 'category';
        defaults.name = 'name';
        dodatado.page('category', 'name', {}, {}, function () {
          var page = dodatado._send.args[0][1];
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
      dodatado.page('category', 'name', {}, function () {
        var page = dodatado._send.args[0][1];
        assert('category' == page.category);
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        done();
      });
    });

    it('should accept (category, name, callback)', function (done) {
      defaults.category = 'category';
      defaults.name = 'name';
      dodatado.page('category', 'name', function () {
        var page = dodatado._send.args[0][1];
        assert('category' == page.category);
        assert('name' == page.name);
        done();
      });
    });

    it('should accept (name, properties, options, callback)', function (
      done) {
      defaults.name = 'name';
      dodatado.page('name', {}, {}, function () {
        var page = dodatado._send.args[0][1];
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should accept (name, properties, callback)', function (done) {
      defaults.name = 'name';
      dodatado.page('name', {}, function () {
        var page = dodatado._send.args[0][1];
        assert('name' == page.name);
        assert('object' == typeof page.properties);
        done();
      });
    });

    it('should accept (name, callback)', function (done) {
      defaults.name = 'name';
      dodatado.page('name', function () {
        var page = dodatado._send.args[0][1];
        assert('name' == page.name);
        done();
      });
    });

    it('should accept (properties, options, callback)', function (done) {
      dodatado.page({}, {}, function () {
        var page = dodatado._send.args[0][1];
        assert(null == page.category);
        assert(null == page.name);
        assert('object' == typeof page.properties);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should accept (properties, callback)', function (done) {
      dodatado.page({}, function () {
        var page = dodatado._send.args[0][1];
        assert(null == page.category);
        assert(null == page.name);
        assert('object' == typeof page.options);
        done();
      });
    });

    it('should back properties with defaults', function () {
      defaults.property = true;
      dodatado.page({
        property: true
      });
      var page = dodatado._send.args[0][1];
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
      dodatado.identify('id', {
        trait: true
      }, {}, function () {
        assert(user.identify.calledWith('id', {
          trait: true
        }));
        done();
      });
    });

    it('should accept (id, traits, callback)', function (done) {
      dodatado.identify('id', {
        trait: true
      }, function () {
        assert(user.identify.calledWith('id', {
          trait: true
        }));
        done();
      });
    });

    it('should accept (id, callback)', function (done) {
      dodatado.identify('id', function () {
        assert(user.identify.calledWith('id'));
        done();
      });
    });

    it('should accept (traits, options, callback)', function (done) {
      // NOTE: this test is not complete
      dodatado.identify({
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
      dodatado.identify({
        trait: true
      }, function () {
        assert(user.identify.calledWith(null, {
          trait: true
        }));
        done();
      });
    });

    it('should identify the user', function () {
      dodatado.identify('id', {
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
      dodatado.identify('id', {
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
    //   dodatado.identify({ created: string });
    //   var created = dodatado._send.args[0][1].created();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   dodatado.identify({ created: milliseconds });
    //   var created = dodatado._send.args[0][1].created();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   dodatado.identify({ created: seconds });
    //   var identify = dodatado._send.args[0][1];
    //   var created = identify.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });

    // it('should parse a company created string into a date', function () {
    //   var date = new Date();
    //   var string = date.getTime() + '';
    //   dodatado.identify({ company: { created: string }});
    //   var identify = dodatado._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse company created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   dodatado.identify({ company: { created: milliseconds }});
    //   var identify = dodatado._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse company created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   dodatado.identify({
    //     company: {
    //       created: seconds
    //     }
    //   });
    //   var identify = dodatado._send.args[0][1];
    //   var created = identify.companyCreated();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });
  });

  describe('#user', function () {
    it('should return the user singleton', function () {
      assert(dodatado.user() == user);
    });
  });

  describe('#company', function () {
    beforeEach(function () {
      sinon.spy(dodatado, '_send');
      sinon.spy(company, 'identify');
    });

    afterEach(function () {
      company.identify.restore();
    });

    it('should return the company singleton', function () {
      assert(dodatado.company() == company);
    });

    it('should accept (id, properties, options, callback)', function (
      done) {
      dodatado.company('id', {
        trait: true
      }, {}, function () {
        company.identify.calledWith('id', {
          trait: true
        });
        done();
      });
    });

    it('should accept (id, properties, callback)', function (done) {
      dodatado.company('id', {
        trait: true
      }, function () {
        company.identify.calledWith('id', {
          trait: true
        });
        done();
      });
    });

    it('should accept (id, callback)', function (done) {
      dodatado.company('id', function () {
        company.identify.calledWith('id');
        done();
      });
    });

    it('should accept (properties, options, callback)', function (
      done) {
      dodatado.company({
        trait: true
      }, {}, function () {
        company.identify.calledWith(null, {
          trait: true
        });
        done();
      });
    });

    it('should accept (properties, callback)', function (done) {
      dodatado.company({
        trait: true
      }, function () {
        company.identify.calledWith(null, {
          trait: true
        });
        done();
      });
    });

    it('should call #identify on the company', function () {
      dodatado.company('id', {
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
      dodatado.company('id', {
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
    //   dodatado.company({ created: string });
    //   var g = dodatado._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === date.getTime());
    // });

    // it('should parse created milliseconds into a date', function () {
    //   var date = new Date();
    //   var milliseconds = date.getTime();
    //   dodatado.company({ created: milliseconds });
    //   var g = dodatado._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === milliseconds);
    // });

    // it('should parse created seconds into a date', function () {
    //   var date = new Date();
    //   var seconds = Math.floor(date.getTime() / 1000);
    //   dodatado.company({ created: seconds });
    //   var g = dodatado._send.args[0][1];
    //   var created = g.created();
    //   assert(is.date(created));
    //   assert(created.getTime() === seconds * 1000);
    // });
  });

  describe('#track', function () {
    beforeEach(function () {
      sinon.spy(dodatado, '_send');
    });

    it('should call #_send', function () {
      dodatado.track();
      assert(dodatado._send.calledWith('track'));
    });

    it('should accept (event, properties, options, callback)', function (
      done) {
      dodatado.track('event', {}, {}, function () {
        var track = dodatado._send.args[0][1];
        assert('event' == track.event);
        assert('object' == typeof track.properties);
        assert('object' == typeof track.options);
        done();
      });
    });

    it('should accept (event, properties, callback)', function (done) {
      dodatado.track('event', {}, function () {
        var track = dodatado._send.args[0][1];
        assert('event' == track.event);
        assert('object' == typeof track.properties);
        done();
      });
    });

    it('should accept (event, callback)', function (done) {
      dodatado.track('event', function () {
        var track = dodatado._send.args[0][1];
        assert('event' == track.event);
        done();
      });
    });

    // it('should safely convert ISO dates to date objects', function () {
    //   var date = new Date(Date.UTC(2013, 9, 5));
    //   dodatado.track('event', {
    //     date: '2013-10-05T00:00:00.000Z',
    //     nonDate: '2013'
    //   });
    //   var track = dodatado._send.args[0][1];
    //   assert(track.properties()
    //     .date.getTime() === date.getTime());
    //   assert(track.properties()
    //     .nonDate === '2013');
    // });
  });

  describe('#trackLink', function () {
    var link;

    beforeEach(function () {
      sinon.spy(dodatado, 'track');
      link = document.createElement('a');
    });

    afterEach(function () {
      window.location.hash = '';
    });

    it('should trigger a track on an element click', function () {
      dodatado.trackLink(link);
      trigger(link, 'click');
      assert(dodatado.track.called);
    });

    it('should accept a jquery object for an element', function () {
      var $link = jQuery(link);
      dodatado.trackLink($link);
      trigger(link, 'click');
      assert(dodatado.track.called);
    });

    it('should send an event and properties', function () {
      dodatado.trackLink(link, 'event', {
        property: true
      });
      trigger(link, 'click');
      assert(dodatado.track.calledWith('event', {
        property: true
      }));
    });

    it('should accept an event function', function () {
      function event(el) {
        return el.nodeName;
      }
      dodatado.trackLink(link, event);
      trigger(link, 'click');
      assert(dodatado.track.calledWith('A'));
    });

    it('should accept a properties function', function () {
      function properties(el) {
        return {
          type: el.nodeName
        };
      }
      dodatado.trackLink(link, 'event', properties);
      trigger(link, 'click');
      assert(dodatado.track.calledWith('event', {
        type: 'A'
      }));
    });

    it('should load an href on click', function (done) {
      link.href = '#test';
      dodatado.trackLink(link);
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
      dodatado.trackLink(link);
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
      sinon.spy(dodatado, 'track');
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
      dodatado.trackForm(form);
      trigger(submit, 'click');
      assert(dodatado.track.called);
    });

    it('should accept a jquery object for an element', function () {
      var $form = jQuery(form);
      dodatado.trackForm(form);
      trigger(submit, 'click');
      assert(dodatado.track.called);
    });

    it('should send an event and properties', function () {
      dodatado.trackForm(form, 'event', {
        property: true
      });
      trigger(submit, 'click');
      assert(dodatado.track.calledWith('event', {
        property: true
      }));
    });

    it('should accept an event function', function () {
      function event(el) {
        return 'event';
      }
      dodatado.trackForm(form, event);
      trigger(submit, 'click');
      assert(dodatado.track.calledWith('event'));
    });

    it('should accept a properties function', function () {
      function properties(el) {
        return {
          property: true
        };
      }
      dodatado.trackForm(form, 'event', properties);
      trigger(submit, 'click');
      assert(dodatado.track.calledWith('event', {
        property: true
      }));
    });

    it('should call submit after a timeout', function (done) {
      var spy = sinon.spy(form, 'submit');
      dodatado.trackForm(form);
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
      dodatado.trackForm(form);
      trigger(submit, 'click');
    });

    it('should trigger an existing jquery submit handler', function (done) {
      var $form = jQuery(form);
      $form.submit(function () {
        done();
      });
      dodatado.trackForm(form);
      trigger(submit, 'click');
    });

    it('should track on a form submitted via jquery', function () {
      var $form = jQuery(form);
      dodatado.trackForm(form);
      $form.submit();
      assert(dodatado.track.called);
    });

    it(
      'should trigger an existing jquery submit handler on a form submitted via jquery',
      function (done) {
        var $form = jQuery(form);
        $form.submit(function () {
          done();
        });
        dodatado.trackForm(form);
        $form.submit();
      });
  });

  describe('#push', function () {
    beforeEach(function () {
      dodatado.track = sinon.spy();
    })

    it('should call methods with args', function () {
      dodatado.push(['track', 'event', {
        prop: true
      }]);
      assert(dodatado.track.calledWith('event', {
        prop: true
      }));
    })
  })

});