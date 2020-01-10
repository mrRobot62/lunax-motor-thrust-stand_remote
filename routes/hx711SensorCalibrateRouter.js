var express = require('express');
var router = express.Router();

// my own controller
var controller = require('../controllers/config/hx711SensorController.js');

/* GET from user input */
router.get('/', controller.calibrate_get);
router.post('/', controller.calibrate_post);

/* POST save data (user click update button*/
router.post('/:id', controller.onUpdateClick_post);

module.exports = router;