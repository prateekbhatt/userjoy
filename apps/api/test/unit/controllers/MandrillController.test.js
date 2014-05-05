describe('Resource /mandrill', function () {

  var MandrillCtrl = require('../../../api/routes/MandrillController');
  var Event = MandrillCtrl._test.Event;


  /**
   * models
   */

  var Conversation = require('../../../api/models/Conversation');


  /**
   * Create test vars for all event types
   */

  var replyEvent;
  var newMessageEvent;
  var openEvent;
  var sendEvent;
  var clickEvent;
  var parentMessageId;
  var conversationId;
  var aid;


  before(function (done) {
    setupTestDb(done);
  });


  /**
   * populate the test event variables
   */

  beforeEach(function () {
    parentMessageId = saved.messages.first._id;
    conversationId = saved.conversations.first._id;
    aid = saved.apps.first.team[0]._id;

    var replyToEmail = aid +
      '+' +
      conversationId +
      '@mail.userjoy.co';


    var newMessageToEmail = aid + '@mail.userjoy.co';
    var savedMessageId = saved.messages.first._id;


    // create reply event
    replyEvent = {
      event: 'inbound',
      ts: 1398340650,
      msg: {
        text: 'another reply\n\nPrateek Bhatt\n\n\nOn Thu, Apr 24, 2014 at 5:25 PM, Prateek Bhatt <prattbhatt@gmail.com> wrote:\n\n> hey world\n>\n> Prateek Bhatt\n>\n>\n> On Thu, Apr 24, 2014 at 4:56 PM, Prateek Bhatt <prattbhatt@gmail.com>wrote:\n>\n>> hello wotld\n>>\n>> Prateek Bhatt\n>>\n>>\n>> On Thu, Apr 24, 2014 at 4:55 PM, DoDataDo <932131312@mail.userjoy.co>wrote:\n>>\n>>> Hi there [object Object]\n>>>\n>>\n>>\n>\n\n',
        html: '<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">another reply</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\n</div>\n<br><br><div class="gmail_quote">On Thu, Apr 24, 2014 at 5:25 PM, Prateek Bhatt <span dir="ltr">&lt;<a href="mailto:prattbhatt@gmail.com" target="_blank">prattbhatt@gmail.com</a>&gt;</span> wrote:<br><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">\n<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">hey world</div></div><div class="gmail_extra"><span class="HOEnZb"><font color="#888888"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\n\n</div></font></span><div><div class="h5">\n<br><br><div class="gmail_quote">On Thu, Apr 24, 2014 at 4:56 PM, Prateek Bhatt <span dir="ltr">&lt;<a href="mailto:prattbhatt@gmail.com" target="_blank">prattbhatt@gmail.com</a>&gt;</span> wrote:<br><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">\n\n<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">hello wotld</div></div><div class="gmail_extra"><span><font color="#888888"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\n\n\n</div></font></span><div>\n<br><br><div class="gmail_quote">On Thu, Apr 24, 2014 at 4:55 PM, DoDataDo <span dir="ltr">&lt;<a href="mailto:932131312@mail.userjoy.co" target="_blank">932131312@mail.userjoy.co</a>&gt;</span> wrote:<br><blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex">\n\n\n<div style="color:red"><h1 style="text-align:center">Hi there [object Object]</h1>\n<img src="http://mandrillapp.com/track/open.php?u=30122920&amp;id=07850686ed1f49a3a816c0e659ebdae4" height="1" width="1"></div>\n</blockquote></div><br></div></div>\n</blockquote></div><br></div></div></div>\n</blockquote></div><br></div>\n\n',
        from_email: 'prattbhatt@gmail.com',
        from_name: 'Prateek Bhatt',
        subject: 'Re: Welcome to DoDataDo2',
        email: replyToEmail,
        tags: [],
        sender: null,
        template: null
      }
    };



    newMessageEvent = {
      event: 'inbound',
      msg: {
        email: newMessageToEmail,
        from_email: 'example.sender@mandrillapp.com',
        html: '<p>This is an example inbound message.</p><img src="http://mandrillapp.com/track/open.php?u=999&id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&tags=_all,_sendexample.sender@mandrillapp.com" height="1" width="1">\n',
        sender: null,
        subject: 'This is an example webhook message',
        tags: [],
        template: null,
        text: 'This is an example inbound message.\n',
        text_flowed: false
      },
      ts: 1368214102
    };


    openEvent = {
      "event": "open",
      "ts": 1398261345,
      "msg": {
        "ts": 1398261262,
        "_id": "7d37f10c41e647e993745d5791e37992",
        "state": "sent",
        "subject": "Welcome to DoDataDo",
        "email": "prattbhatt@gmail.com",
        "metadata": {
          "mId": savedMessageId
        },
        "sender": "example1@mail.userjoy.co",
        "template": null
      }
    };

    sendEvent = {
      "event": "send",
      "ts": 1398261345,
      "msg": {
        "ts": 1398261262,
        "_id": "7d37f10c41e647e993745d5791e37992",
        "state": "sent",
        "subject": "Welcome to DoDataDo",
        "email": "prattbhatt@gmail.com",
        "metadata": {
          "mId": savedMessageId
        },
        "sender": "example1@mail.userjoy.co",
        "template": null
      }
    };

    clickEvent = {
      "event": "click",
      "ts": 1398261345,
      "msg": {
        "ts": 1398261262,
        "_id": "7d37f10c41e647e993745d5791e37992",
        "state": "sent",
        "subject": "Welcome to DoDataDo",
        "email": "prattbhatt@gmail.com",
        "metadata": {
          "mId": savedMessageId
        },
        "sender": "example1@mail.userjoy.co",
        "template": null
      }
    };

  });

  describe('POST /mandrill', function () {


    it('should handle replies', function (done) {

      var postData = {
        mandrill_events: JSON.stringify([replyEvent])
      };

      request
        .post('/mandrill')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);


    });


    it('should handle new messages', function (done) {

      var postData = {
        mandrill_events: JSON.stringify([newMessageEvent])
      };


      request
        .post('/mandrill')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);


    });


    it('should handle open events', function (done) {

      var postData = {
        mandrill_events: JSON.stringify([openEvent])
      };

      request
        .post('/mandrill')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);


    });


    it('should handle send events', function (done) {

      var postData = {
        mandrill_events: JSON.stringify([sendEvent])
      };

      request
        .post('/mandrill')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);


    });


    it('should handle click events', function (done) {

      var postData = {
        mandrill_events: JSON.stringify([clickEvent])
      };

      request
        .post('/mandrill')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);


    });

  });


  describe('Event()', function () {

    it('should create new Event', function () {

      var event = new Event(replyEvent);

      expect(event)
        .to.be.an("object");

      expect(event.coId)
        .to.eql(conversationId.toString());

      expect(event.mId)
        .to.not.exist;

      expect(event.aid)
        .to.eql(aid.toString());

      expect(event.text)
        .to.eql(replyEvent.msg.text);

    });

  });


  describe('Event#processReply', function () {

    var event;

    before(function () {
      event = new Event(replyEvent);
    });


    it('should create reply', function (done) {

      event.processReply.call(event, function (err, savedReply) {

        expect(err)
          .to.not.exist;

        expect(savedReply)
          .to.not.be.empty;

        expect(savedReply.coId)
          .to.eql(conversationId);

        expect(savedReply.from)
          .to.eql('user');

        expect(savedReply.type)
          .to.eql('email');

        expect(savedReply.sent)
          .to.eql(true);

        expect(savedReply.text)
          .to.eql(replyEvent.msg.text);

        done();
      })
    });


    it('should update the Conversation toRead status to true',
      function (done) {

        Conversation
          .findById(event.coId)
          .exec(function (err, con) {

            expect(err)
              .to.not.exist;

            expect(con)
              .to.have.property("toRead", true);

            done();
          });

      });

  });


  describe('Event#processNewMessage', function () {

    var event;
    var savedNewMessage;

    before(function () {
      event = new Event(newMessageEvent);
    });


    it('should create new message', function (done) {

      event.processNewMessage.call(event, function (err, savedMessage) {

        expect(err)
          .to.not.exist;

        expect(savedMessage)
          .to.not.be.empty;

        savedNewMessage = savedMessage;

        expect(savedMessage)
          .to.have.property("coId");

        expect(savedMessage)
          .to.have.property("from", "user");

        expect(savedMessage)
          .to.have.property("type", "email");

        expect(savedMessage)
          .to.have.property("sent", true);

        expect(savedMessage)
          .to.have.property("text", newMessageEvent.msg.text);

        done();
      })
    });

    // this test depends on the previous test
    it('should create new Conversation with toRead status as true',
      function (done) {

        Conversation
          .findById(savedNewMessage.coId)
          .exec(function (err, con) {

            expect(err)
              .to.not.exist;

            expect(con)
              .to.have.property("toRead", true);

            done();
          });

      });

  });

});
