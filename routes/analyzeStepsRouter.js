var express = require('express');
var router = express.Router();

// my own controller
var controller = require('../controllers/config/analyzeStepsController.js');

/* GET from user input */
router.get('/', controller.index);

module.exports = router;
