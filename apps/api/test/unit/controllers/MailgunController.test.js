describe('Resource /mailgun', function () {

  var MailgunCtrl = require('../../../api/routes/MailgunController');


  /**
   * models
   */

  var AutoMessage = require('../../../api/models/AutoMessage');
  var Conversation = require('../../../api/models/Conversation');


  /**
   * Create test vars for all event types
   */

  var replyEvent;
  var newMessageEvent;
  var openEvent;
  var sendEvent;
  var clickEvent;
  var manualMessageId;
  var automessageId;
  var aid;
  var uid;


  before(function (done) {
    setupTestDb(done);
  });


  /**
   * populate the test event variables
   */

  beforeEach(function () {

    aid = saved.conversations.first.aid;
    uid = saved.users.first._id;
    automessageId = saved.automessages.first._id;
    manualMessageId = saved.conversations.first.messages[0]._id;



    var newMessageToEmail = aid + '@mail.userjoy.co';




  });



  describe('POST /mailgun/opens', function () {

    it('should handle seen events for manual message', function (done) {

      // opened
      var postData = {
        uj_mid: manualMessageId,
        uj_type: 'manual',
        event: 'opened',
        timestamp: '1403119454',
        city: 'Mountain View',
        domain: 'mail.userjoy.co',
        'device-type': 'desktop',
        'client-type': 'browser',
        ip: '66.249.84.28',
        region: 'CA',
        'client-name': 'Firefox',
        'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7 (via ggpht.com GoogleImageProxy)',
        country: 'US',
        'client-os': 'Windows',
        h: 'cca5cc76a8f7927ca5767a7a07711ad2',
        'message-id': '3465d93faa3870d007e54fc1625612@prateek',
        recipient: 'prattbhatt@gmail.com',
        token: '3aitb8d4cmoza0pyx2693j145vey-fkgw3p89yskhtmxtlcc14',
        signature: '6cce16f515eef2baed2efe279d08dca631a25fd93dc98c6da8b9191ec11edc92'
      };

      request
        .post('/mailgun/opens')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });


    it('should handle seen events for automessage events', function (
      done) {


      // opened
      var postData = {
        uj_type: 'auto',
        uj_mid: automessageId,
        uj_aid: aid,
        uj_uid: uid,
        uj_title: 'In App Welcome Message',
        event: 'opened',
        timestamp: '1403119454',
        city: 'Mountain View',
        domain: 'mail.userjoy.co',
        'device-type': 'desktop',
        'client-type': 'browser',
        ip: '66.249.84.28',
        region: 'CA',
        'client-name': 'Firefox',
        'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7 (via ggpht.com GoogleImageProxy)',
        country: 'US',
        'client-os': 'Windows',
        h: 'cca5cc76a8f7927ca5767a7a07711ad2',
        'message-id': '3465d93faa3870d007e54fc1625612@prateek',
        recipient: 'prattbhatt@gmail.com',
        token: '3aitb8d4cmoza0pyx2693j145vey-fkgw3p89yskhtmxtlcc14',
        signature: '6cce16f515eef2baed2efe279d08dca631a25fd93dc98c6da8b9191ec11edc92'
      };

      async.series(

        [

          function zeroSeen(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.seen)
                  .to.eql(0);

                cb(err);
              });

          },


          function makeRequest(cb) {

            request
              .post('/mailgun/opens')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },

          function oneSeen(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.seen)
                  .to.eql(1);

                cb(err);
              });

          },

          function seeSameAutomessageAgain(cb) {

            request
              .post('/mailgun/opens')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },


          function stillOneOpened(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.seen)
                  .to.eql(1);

                cb(err);
              });

          }

        ],

        done

      );


    });


  });


  describe('/clicks', function () {

    it('should handle clicked events for manual message', function (done) {

      var postData = {
        uj_mid: manualMessageId,
        event: 'clicked',
        uj_type: 'manual',
        timestamp: '1403119454',
        city: 'Mountain View',
        domain: 'mail.userjoy.co',
        'device-type': 'desktop',
        'client-type': 'browser',
        ip: '66.249.84.28',
        region: 'CA',
        'client-name': 'Firefox',
        'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7 (via ggpht.com GoogleImageProxy)',
        country: 'US',
        'client-os': 'Windows',
        h: 'cca5cc76a8f7927ca5767a7a07711ad2',
        'message-id': '3465d93faa3870d007e54fc1625612@prateek',
        recipient: 'prattbhatt@gmail.com',
        token: '3aitb8d4cmoza0pyx2693j145vey-fkgw3p89yskhtmxtlcc14',
        signature: '6cce16f515eef2baed2efe279d08dca631a25fd93dc98c6da8b9191ec11edc92'
      };


      request
        .post('/mailgun/clicks')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });


    it('should handle clicked events for automessage events', function (
      done) {

      var postData = {
        uj_type: 'auto',
        uj_mid: automessageId,
        uj_aid: aid,
        uj_uid: uid,
        uj_title: 'In App Welcome Message',
        event: 'clicked',
        timestamp: '1403119454',
        city: 'Mountain View',
        domain: 'mail.userjoy.co',
        'device-type': 'desktop',
        'client-type': 'browser',
        ip: '66.249.84.28',
        region: 'CA',
        'client-name': 'Firefox',
        'user-agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7 (via ggpht.com GoogleImageProxy)',
        country: 'US',
        'client-os': 'Windows',
        h: 'cca5cc76a8f7927ca5767a7a07711ad2',
        'message-id': '3465d93faa3870d007e54fc1625612@prateek',
        recipient: 'prattbhatt@gmail.com',
        token: '3aitb8d4cmoza0pyx2693j145vey-fkgw3p89yskhtmxtlcc14',
        signature: '6cce16f515eef2baed2efe279d08dca631a25fd93dc98c6da8b9191ec11edc92'
      };

      async.series(

        [

          function zeroClicked(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.clicked)
                  .to.eql(0);

                cb(err);
              });

          },


          function makeRequest(cb) {

            request
              .post('/mailgun/clicks')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },

          function oneClicked(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.clicked)
                  .to.eql(1);

                cb(err);
              });

          },

          function clickSameAutomessageAgain(cb) {

            request
              .post('/mailgun/clicks')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },


          function stillOneClicked(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.clicked)
                  .to.eql(1);

                cb(err);
              });

          }

        ],

        done

      );




    });


  });


  describe('POST /mailgun/delivers', function () {

    it('should handle sent events for manual message', function (done) {

      var postData = {
        uj_mid: manualMessageId,
        uj_type: 'manual',
        timestamp: '1403119291',
        'X-Mailgun-Sid': 'WyIwODE3NiIsICJwcmF0dGJoYXR0QGdtYWlsLmNvbSIsICIxMmE0YjUiXQ==',
        domain: 'mail.userjoy.co',
        'message-headers': '[["Received", "from [127.0.0.1] (115.118.48.146.static-ttsl-hyderabad.vsnl.net.in [115.118.48.146]) by mxa.mailgun.org with ESMTP id 53a1e6b2.7f68e80645d0-in1; Wed, 18 Jun 2014 19:21:22 -0000 (UTC)"], ["X-Mailer", "UserJoy Mailer"], ["Date", "Wed, 18 Jun 2014 19:21:18 GMT"], ["Message-Id", "<3465d93faa3870d007e54fc1625612@prateek>"], ["X-Mailgun-Track", "yes"], ["X-Mailgun-Track-Clicks", "yes"], ["X-Mailgun-Track-Opens", "yes"], ["X-Mailgun-Variables", "{\\"uj_type\\":\\"manual\\",\\"uj_mid\\":\\"53a1e6a9ecc26ee1312b4fe6\\"}"], ["From", "\\"prateek\\" <539dd58b5278319f3fc6bbce@mail.userjoy.co>"], ["To", "prattbhatt@gmail.com"], ["Reply-To", "\\"Reply to prateek\\" <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>"], ["Subject", "hello"], ["Content-Type", ["multipart/alternative", {"boundary": "----Nodemailer-0.6.3-?=_1-1403119281988"}]], ["Mime-Version", "1.0"], ["X-Mailgun-Sid", "WyIwODE3NiIsICJwcmF0dGJoYXR0QGdtYWlsLmNvbSIsICIxMmE0YjUiXQ=="], ["Sender", "539dd58b5278319f3fc6bbce@mail.userjoy.co"]]',
        'Message-Id': '<3465d93faa3870d007e54fc1625612@prateek>',
        recipient: 'prattbhatt@gmail.com',
        event: 'delivered',
        token: '0vpea1fd8065n7ipgs1mahvzzr0muec64m1yync8930eahngs1',
        signature: '9524cc239c16dde95b8cbe99172e8b9ffd7bf44f25e6fa216b6ec357a03c8e05'
      }

      request
        .post('/mailgun/delivers')
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });


    it('should handle sent events for automessage events', function (done) {

      var postData = {
        uj_mid: automessageId,
        uj_type: 'auto',
        uj_aid: aid,
        uj_uid: uid,
        uj_title: 'In App Welcome Message',
        event: 'delivered',
        timestamp: '1403119291',
        'X-Mailgun-Sid': 'WyIwODE3NiIsICJwcmF0dGJoYXR0QGdtYWlsLmNvbSIsICIxMmE0YjUiXQ==',
        domain: 'mail.userjoy.co',
        'message-headers': '[["Received", "from [127.0.0.1] (115.118.48.146.static-ttsl-hyderabad.vsnl.net.in [115.118.48.146]) by mxa.mailgun.org with ESMTP id 53a1e6b2.7f68e80645d0-in1; Wed, 18 Jun 2014 19:21:22 -0000 (UTC)"], ["X-Mailer", "UserJoy Mailer"], ["Date", "Wed, 18 Jun 2014 19:21:18 GMT"], ["Message-Id", "<3465d93faa3870d007e54fc1625612@prateek>"], ["X-Mailgun-Track", "yes"], ["X-Mailgun-Track-Clicks", "yes"], ["X-Mailgun-Track-Opens", "yes"], ["X-Mailgun-Variables", "{\\"uj_type\\":\\"manual\\",\\"uj_mid\\":\\"53a1e6a9ecc26ee1312b4fe6\\"}"], ["From", "\\"prateek\\" <539dd58b5278319f3fc6bbce@mail.userjoy.co>"], ["To", "prattbhatt@gmail.com"], ["Reply-To", "\\"Reply to prateek\\" <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>"], ["Subject", "hello"], ["Content-Type", ["multipart/alternative", {"boundary": "----Nodemailer-0.6.3-?=_1-1403119281988"}]], ["Mime-Version", "1.0"], ["X-Mailgun-Sid", "WyIwODE3NiIsICJwcmF0dGJoYXR0QGdtYWlsLmNvbSIsICIxMmE0YjUiXQ=="], ["Sender", "539dd58b5278319f3fc6bbce@mail.userjoy.co"]]',
        'Message-Id': '<3465d93faa3870d007e54fc1625612@prateek>',
        recipient: 'prattbhatt@gmail.com',
        token: '0vpea1fd8065n7ipgs1mahvzzr0muec64m1yync8930eahngs1',
        signature: '9524cc239c16dde95b8cbe99172e8b9ffd7bf44f25e6fa216b6ec357a03c8e05'
      };



      async.series(

        [

          function zeroSent(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.sent)
                  .to.eql(0);

                cb(err);
              });

          },


          function makeRequest(cb) {

            request
              .post('/mailgun/delivers')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },

          function oneSent(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.sent)
                  .to.eql(1);

                cb(err);
              });

          },

          function deliverSameAutomessageAgain(cb) {

            request
              .post('/mailgun/delivers')
              .send(postData)
              .expect('Content-Type', /json/)
              .expect(200)
              .end(cb);
          },


          function stillOneSent(cb) {

            AutoMessage
              .findById(automessageId)
              .exec(function (err, amsg) {

                expect(err)
                  .to.not.exist;

                expect(amsg.sent)
                  .to.eql(1);

                cb(err);
              });

          }

        ],

        done

      );

    });

  });

  describe('POST /mailgun/new/apps/:aid', function () {

    var aid;
    var url;

    it('should handle new messages', function (done) {
      aid = saved.apps.first._id;
      url = '/mailgun/new/apps/' + aid;

      var postData = {
        recipient: aid + '@mail.userjoy.co',
        sender: 'prattbhatt@gmail.com',
        subject: 'Hello',
        from: 'Prateek Bhatt <prattbhatt@gmail.com>',
        'X-Envelope-From': '<prattbhatt@gmail.com>',
        Received: [
          'from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)',
          'by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
          'by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)'
        ],
        'Dkim-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw==',
        'Mime-Version': '1.0',
        'X-Received': 'by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
        'In-Reply-To': '<3465d93faa3870d007e54fc1625612@prateek>',
        References: '<3465d93faa3870d007e54fc1625612@prateek>',
        Date: 'Thu, 19 Jun 2014 00:54:48 +0530',
        'Message-Id': '<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>',
        Subject: 'Re: hello',
        From: 'Prateek Bhatt <prattbhatt@gmail.com>',
        To: 'Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>',
        'Content-Type': 'multipart/alternative; boundary="047d7b2ed201ad2a9404fc213647"',
        'X-Mailgun-Incoming': 'Yes',
        'message-headers': '[["X-Envelope-From", "<prattbhatt@gmail.com>"], ["Received", "from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)"], ["Received", "by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Dkim-Signature", "v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw=="], ["Mime-Version", "1.0"], ["X-Received", "by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Received", "by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["In-Reply-To", "<3465d93faa3870d007e54fc1625612@prateek>"], ["References", "<3465d93faa3870d007e54fc1625612@prateek>"], ["Date", "Thu, 19 Jun 2014 00:54:48 +0530"], ["Message-Id", "<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>"], ["Subject", "Re: hello"], ["From", "Prateek Bhatt <prattbhatt@gmail.com>"], ["To", "Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>"], ["Content-Type", "multipart/alternative; boundary=\\"047d7b2ed201ad2a9404fc213647\\""], ["X-Mailgun-Incoming", "Yes"]]',
        timestamp: '1403119495',
        token: '2yknsyfhs0y7gw3tnbc53hb112l7emr-7tpyobxal8004ga858',
        signature: 'c508d46a5c27df10de33861bf3a89df5d77172e227447e976f6b250642732589',
        'body-plain': 'reply body\r\n\r\nPrateek Bhatt\r\n\r\n\r\nOn Thu, Jun 19, 2014 at 12:51 AM, prateek <\r\n539dd58b5278319f3fc6bbce@mail.userjoy.co> wrote:\r\n\r\n> ###-----------------###\r\n>\r\n> eorld\r\n>\r\n',
        'body-html': '<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><div class="gmail_quote">On Thu, Jun 19, 2014 at 12:51 AM, prateek <span dir="ltr">&lt;<a href="mailto:539dd58b5278319f3fc6bbce@mail.userjoy.co" target="_blank">539dd58b5278319f3fc6bbce@mail.userjoy.co</a>&gt;</span> wrote:<br>\r\n<blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><div><div style="overflow:hidden"> \r\n  <span style="display:none!important">###-----------------###</span>\r\n</div>\r\n<br>\r\n\r\n\r\n  \r\n    eorld\r\n  \r\n  <br>\r\n  <div style="border-left:1px solid #999;margin-left:20px">\r\n    \r\n  </div>\r\n\r\n<img width="1px" height="1px" alt="" src="http://email.mail.userjoy.co/o/ZD0xMmE0YjUmdWpfbWlkPTUzYTFlNmE5ZWNjMjZlZTEzMTJiNGZlNiZoPWNjYTVjYzc2YThmNzkyN2NhNTc2N2E3YTA3NzExYWQyJmk9MzQ2NWQ5M2ZhYTM4NzBkMDA3ZTU0ZmMxNjI1NjEyJTQwcHJhdGVlayZyPXByYXR0YmhhdHQlNDBnbWFpbC5jb20mdWpfdHlwZT1tYW51YWw"></div>\r\n</blockquote></div><br></div>\r\n',
        'stripped-html': '<html><body><div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><br></div></body></html>',
        'stripped-text': 'reply body\r\n',
        'stripped-signature': 'Prateek Bhatt'
      };

      request
        .post(url)
        .send(postData)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(done);

    });

  });



  describe('POST /mailgun/reply/apps/:aid/conversations/:identifier',
    function () {

      var aid;

      beforeEach(function () {
        aid = saved.apps.first._id;
      });


      it('should handle replies to manual messages', function (done) {

        var conversationId = saved.conversations.first._id;
        var identifier = 'm_' + conversationId;
        var replyToEmailManual = aid + '+' + identifier +
          '@mail.userjoy.co';
        var url = '/mailgun/reply/apps/' + aid + '/conversations/' +
          identifier;

        var postData = {
          recipient: replyToEmailManual,
          sender: 'prattbhatt@gmail.com',
          subject: 'Re: hello',
          from: 'Prateek Bhatt <prattbhatt@gmail.com>',
          'X-Envelope-From': '<prattbhatt@gmail.com>',
          Received: [
            'from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)',
            'by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
            'by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)'
          ],
          'Dkim-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw==',
          'Mime-Version': '1.0',
          'X-Received': 'by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
          'In-Reply-To': '<3465d93faa3870d007e54fc1625612@prateek>',
          References: '<3465d93faa3870d007e54fc1625612@prateek>',
          Date: 'Thu, 19 Jun 2014 00:54:48 +0530',
          'Message-Id': '<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>',
          Subject: 'Re: hello',
          From: 'Prateek Bhatt <prattbhatt@gmail.com>',
          To: 'Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>',
          'Content-Type': 'multipart/alternative; boundary="047d7b2ed201ad2a9404fc213647"',
          'X-Mailgun-Incoming': 'Yes',
          'message-headers': '[["X-Envelope-From", "<prattbhatt@gmail.com>"], ["Received", "from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)"], ["Received", "by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Dkim-Signature", "v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw=="], ["Mime-Version", "1.0"], ["X-Received", "by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Received", "by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["In-Reply-To", "<3465d93faa3870d007e54fc1625612@prateek>"], ["References", "<3465d93faa3870d007e54fc1625612@prateek>"], ["Date", "Thu, 19 Jun 2014 00:54:48 +0530"], ["Message-Id", "<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>"], ["Subject", "Re: hello"], ["From", "Prateek Bhatt <prattbhatt@gmail.com>"], ["To", "Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>"], ["Content-Type", "multipart/alternative; boundary=\\"047d7b2ed201ad2a9404fc213647\\""], ["X-Mailgun-Incoming", "Yes"]]',
          timestamp: '1403119495',
          token: '2yknsyfhs0y7gw3tnbc53hb112l7emr-7tpyobxal8004ga858',
          signature: 'c508d46a5c27df10de33861bf3a89df5d77172e227447e976f6b250642732589',
          'body-plain': 'reply body\r\n\r\nPrateek Bhatt\r\n\r\n\r\nOn Thu, Jun 19, 2014 at 12:51 AM, prateek <\r\n539dd58b5278319f3fc6bbce@mail.userjoy.co> wrote:\r\n\r\n> ###-----------------###\r\n>\r\n> eorld\r\n>\r\n',
          'body-html': '<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><div class="gmail_quote">On Thu, Jun 19, 2014 at 12:51 AM, prateek <span dir="ltr">&lt;<a href="mailto:539dd58b5278319f3fc6bbce@mail.userjoy.co" target="_blank">539dd58b5278319f3fc6bbce@mail.userjoy.co</a>&gt;</span> wrote:<br>\r\n<blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><div><div style="overflow:hidden"> \r\n  <span style="display:none!important">###-----------------###</span>\r\n</div>\r\n<br>\r\n\r\n\r\n  \r\n    eorld\r\n  \r\n  <br>\r\n  <div style="border-left:1px solid #999;margin-left:20px">\r\n    \r\n  </div>\r\n\r\n<img width="1px" height="1px" alt="" src="http://email.mail.userjoy.co/o/ZD0xMmE0YjUmdWpfbWlkPTUzYTFlNmE5ZWNjMjZlZTEzMTJiNGZlNiZoPWNjYTVjYzc2YThmNzkyN2NhNTc2N2E3YTA3NzExYWQyJmk9MzQ2NWQ5M2ZhYTM4NzBkMDA3ZTU0ZmMxNjI1NjEyJTQwcHJhdGVlayZyPXByYXR0YmhhdHQlNDBnbWFpbC5jb20mdWpfdHlwZT1tYW51YWw"></div>\r\n</blockquote></div><br></div>\r\n',
          'stripped-html': '<html><body><div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><br></div></body></html>',
          'stripped-text': 'reply body\r\n',
          'stripped-signature': 'Prateek Bhatt'
        };

        request
          .post(url)
          .send(postData)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done);

      });


      it('should handle replies to automessages', function (done) {

        var messageId = saved.automessages.first._id;
        var identifier = 'u_' + messageId;

        var replyToEmailAuto = aid + '+' + identifier +
          '@test-mail.userjoy.co';

        var url = '/mailgun/reply/apps/' + aid + '/conversations/' +
          identifier;

        var postData = {
          recipient: replyToEmailAuto,
          sender: 'prattbhatt@gmail.com',
          subject: 'Re: hello',
          from: 'Prateek Bhatt <prattbhatt@gmail.com>',
          'X-Envelope-From': '<prattbhatt@gmail.com>',
          Received: [
            'from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)',
            'by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
            'by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)'
          ],
          'Dkim-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw==',
          'Mime-Version': '1.0',
          'X-Received': 'by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)',
          'In-Reply-To': '<3465d93faa3870d007e54fc1625612@prateek>',
          References: '<3465d93faa3870d007e54fc1625612@prateek>',
          Date: 'Thu, 19 Jun 2014 00:54:48 +0530',
          'Message-Id': '<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>',
          Subject: 'Re: hello',
          From: 'Prateek Bhatt <prattbhatt@gmail.com>',
          To: 'Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@test-mail.userjoy.co>',
          'Content-Type': 'multipart/alternative; boundary="047d7b2ed201ad2a9404fc213647"',
          'X-Mailgun-Incoming': 'Yes',
          'message-headers': '[["X-Envelope-From", "<prattbhatt@gmail.com>"], ["Received", "from mail-vc0-f175.google.com (mail-vc0-f175.google.com [209.85.220.175]) by mxa.mailgun.org with ESMTP id 53a1e782.7fdf56827770-in3; Wed, 18 Jun 2014 19:24:50 -0000 (UTC)"], ["Received", "by mail-vc0-f175.google.com with SMTP id hy4so1257720vcb.6 for <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Dkim-Signature", "v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20120113; h=mime-version:in-reply-to:references:date:message-id:subject:from:to :content-type; bh=mkPbjGJ5QNE8/UjGFkulM+FK6SjCO9QE8MlsUdY225s=; b=Ap0tZC2vWxeYiZrQXvwFKL+N77LVoBXEMpCdietBwZf+yRudotfeih/BFBOXL2gbbF AC4jittfMtWRg9UI0bQ8coW812d2adoM1JuVMe9PF51QFoFElvpmoSjfkg4F99y6nrKe 70ALKCiAAW1pZS8Mn2DGzBrkzK2MjnfbG6MJAWMgHJ0eXqQ9ZpNWTIItDP494NNae0VY ceLui9IqI1dnKDPIVYXV54GNqAGxOjYGsO2zEThLuoWLEX8DuqBLSgO6fleW7WVTzUhl e+YDR+nTdeHOq/npQqOJqxOpUoSCdsHrWxl2SNRmNz5P54AVgQieNGp4uJVqlHTWK+/V l2pw=="], ["Mime-Version", "1.0"], ["X-Received", "by 10.58.122.196 with SMTP id lu4mr94612veb.52.1403119488279; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["Received", "by 10.220.220.15 with HTTP; Wed, 18 Jun 2014 12:24:48 -0700 (PDT)"], ["In-Reply-To", "<3465d93faa3870d007e54fc1625612@prateek>"], ["References", "<3465d93faa3870d007e54fc1625612@prateek>"], ["Date", "Thu, 19 Jun 2014 00:54:48 +0530"], ["Message-Id", "<CANxoqd841GbOz3xHkKGyBZ=3OiCwuF-cQhgxf6Qwx8Q4NzhHoQ@mail.gmail.com>"], ["Subject", "Re: hello"], ["From", "Prateek Bhatt <prattbhatt@gmail.com>"], ["To", "Reply to prateek <539dd58b5278319f3fc6bbce+m_53a1e6a9ecc26ee1312b4fe5@mail.userjoy.co>"], ["Content-Type", "multipart/alternative; boundary=\\"047d7b2ed201ad2a9404fc213647\\""], ["X-Mailgun-Incoming", "Yes"]]',
          timestamp: '1403119495',
          token: '2yknsyfhs0y7gw3tnbc53hb112l7emr-7tpyobxal8004ga858',
          signature: 'c508d46a5c27df10de33861bf3a89df5d77172e227447e976f6b250642732589',
          'body-plain': 'reply body\r\n\r\nPrateek Bhatt\r\n\r\n\r\nOn Thu, Jun 19, 2014 at 12:51 AM, prateek <\r\n539dd58b5278319f3fc6bbce@mail.userjoy.co> wrote:\r\n\r\n> ###-----------------###\r\n>\r\n> eorld\r\n>\r\n',
          'body-html': '<div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><div class="gmail_quote">On Thu, Jun 19, 2014 at 12:51 AM, prateek <span dir="ltr">&lt;<a href="mailto:539dd58b5278319f3fc6bbce@mail.userjoy.co" target="_blank">539dd58b5278319f3fc6bbce@mail.userjoy.co</a>&gt;</span> wrote:<br>\r\n<blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex"><div><div style="overflow:hidden"> \r\n  <span style="display:none!important">###-----------------###</span>\r\n</div>\r\n<br>\r\n\r\n\r\n  \r\n    eorld\r\n  \r\n  <br>\r\n  <div style="border-left:1px solid #999;margin-left:20px">\r\n    \r\n  </div>\r\n\r\n<img width="1px" height="1px" alt="" src="http://email.mail.userjoy.co/o/ZD0xMmE0YjUmdWpfbWlkPTUzYTFlNmE5ZWNjMjZlZTEzMTJiNGZlNiZoPWNjYTVjYzc2YThmNzkyN2NhNTc2N2E3YTA3NzExYWQyJmk9MzQ2NWQ5M2ZhYTM4NzBkMDA3ZTU0ZmMxNjI1NjEyJTQwcHJhdGVlayZyPXByYXR0YmhhdHQlNDBnbWFpbC5jb20mdWpfdHlwZT1tYW51YWw"></div>\r\n</blockquote></div><br></div>\r\n',
          'stripped-html': '<html><body><div dir="ltr"><div class="gmail_default" style="font-family:tahoma,sans-serif">reply body</div></div><div class="gmail_extra"><br clear="all"><div><div dir="ltr"><font face="tahoma, sans-serif" color="#444444">Prateek Bhatt</font></div>\r\n</div>\r\n<br><br><br></div></body></html>',
          'stripped-text': 'reply body\r\n',
          'stripped-signature': 'Prateek Bhatt'
        };

        console.log('\n\n\n url', url);





        async.series(

          [

            function zeroReplied(cb) {

              AutoMessage
                .findById(messageId)
                .exec(function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.replied)
                    .to.eql(0);

                  cb(err);
                });

            },


            function makeRequest(cb) {

              request
                .post(url)
                .send(postData)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(done);
            },

            function oneReplied(cb) {

              AutoMessage
                .findById(messageId)
                .exec(function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.replied)
                    .to.eql(1);

                  cb(err);
                });

            },

            function replyToSameAutomessageAgain(cb) {

              request
                .post(url)
                .send(postData)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(done);
            },


            function stillOneReplied(cb) {

              AutoMessage
                .findById(messageId)
                .exec(function (err, amsg) {

                  expect(err)
                    .to.not.exist;

                  expect(amsg.replied)
                    .to.eql(1);

                  cb(err);
                });

            }

          ],

          done

        );



      });


    });


});
