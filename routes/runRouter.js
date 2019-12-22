var express = require('express');
var router = express.Router();

/* GET from user input */
router.get('/', function(req, res, next) {
  res.send('RUN router was called');
});

module.exports = router;