var router = require('express')
  .Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.json({
    "message": "Welcome to the UserJoy API. Check out the documentation at: docs.userjoy.co"
  });
});

module.exports = router;
