/**
 * Module Dependencies
 */

var router = require('express')
  .Router();

/**
 * Models
 */

// var contactUs = require('../models/Contact');


/**
 * Services
 */

var accountMailer = require('../services/account-mailer');

router
  .route('/')
  .post(function (req, res, next) {
    var email = req.body.email;
    var message = req.body.message;

    if(!email) {
      res
        .status(400)
        .json({
          message: 'Email is required'
        })
      return;
    }

    if(!message) {
      res
        .status(400)
        .json({
          message: 'Message is required'
        })
      return;
    }

    var mailOptions = {
      locals: {
        message: message,
        email: email
      },
      to: {
        email: 'support@userjoy.co'
      }
    }

    accountMailer.sendContactUserJoy(mailOptions, function (err) {

      if (err) return next(err);

      res
        .status(200)
        .json({
          message: 'We have received your message. We will get back to you ASAP.'
        })

    });
  });


module.exports = router;
