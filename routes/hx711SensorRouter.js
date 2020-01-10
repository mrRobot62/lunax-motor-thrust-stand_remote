var express = require('express');
var router = express.Router();

// my own controller
var controller = require('../controllers/config/hx711SensorController.js');

/* GET from user input */
router.get('/', controller.data_get);

/* POST save data */
router.post('/', controller.data_post);

module.exports = router;