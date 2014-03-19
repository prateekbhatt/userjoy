var router = require('express')
  .Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.json({
    "message": "Welcome to DoDataDo API"
  });
});

module.exports = router;
