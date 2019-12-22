var express = require('express');
var router = express.Router();

// my own controller
var controller = require('../controllers/config/analyzeStepsController.js');



//router.get('/', function(req, res, next) {
//  res.send('AnalyzeSteps router was called');
//});

/* GET from user input */
router.get('/', controller.index);

module.exports = router;
