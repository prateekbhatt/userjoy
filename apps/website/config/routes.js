/**
 * Routes
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {


  // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
  // default view engine) your home page.
  //
  // (Alternatively, remove this and add an `index.html` file in your `assets` directory)
  '/': {
    view: 'homepage',
    locals: {
      meta_desc: 'See what users are doing on your app in realtime, and communicate personally with them'
    }
  },

  '/signup': {
    view: 'signup',
    locals: {
      title: 'Get started with customer success : Create an account',
      meta_desc: 'Create an UserJoy account and increase freemium / trial conversions and customer engagement'
    }
  },

  '/convert': {
    view: 'customers_acquire',
    locals: {
      title: 'Increase SaaS freemium and trial conversions',
      meta_desc: 'Create an UserJoy account and increase freemium / trial conversions and customer engagement'
    }
  },

  '/retain': {
    view: 'customers_retain',
    locals: {
      title: 'Improve SaaS engagement and retentions',
      meta_desc: 'Create an UserJoy account and increase freemium / trial conversions and customer engagement'
    }
  },

  '/monetize': {
    view: 'customers_monetize',
    locals: {
      title: 'Increase renewals, upsells and referrals',
      meta_desc: 'Create an UserJoy account and increase freemium / trial conversions and customer engagement'
    }
  },

  '/product': {
    view: 'product',
    locals: {
      title: 'Easy Customer Success Management for SaaS teams',
      meta_desc: 'Create an UserJoy account and increase freemium / trial conversions and customer engagement'
    }
  },

  '/legal/terms': {
    view: 'termsofservice',
    locals: {
      title: 'Terms of Service',
      meta_desc: 'The terms of service of UserJoy'
    }
  },

  '/legal/privacy': {
    view: 'privacypolicy',
    locals: {
      title: 'Privacy Policy',
      meta_desc: 'The privacy policy of UserJoy'
    }
  },

  '/legal/refund': {
    view: 'refundpolicy',
    locals: {
      title: 'Refund Policy',
      meta_desc: 'The refund policy of UserJoy'
    }
  },

  '/contact': {
    view: 'contact',
    locals: {
      title: 'Contact Us',
      meta_desc: 'Questions? Need Help? Send us an email, schedule a call or follow us on Twitter at @userjoyco.'
    }
  },

  '/pricing': {
    view: 'pricing',
    locals: {
      title: 'Pricing',
      meta_desc: 'Get started with a 14-day free trial. There\'s no risk, no obligation and no credit card required. You can cancel your account at any time.'
    }
  },

  // Custom routes here...


  // If a request to a URL doesn't match any of the custom routes above, it is matched
  // against Sails route blueprints.  See `config/blueprints.js` for configuration options
  // and examples.

};
