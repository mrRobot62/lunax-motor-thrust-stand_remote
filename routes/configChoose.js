/**
 * This file call only the main config site
 * 
 */
var express = require('express');
var router = express.Router();

// my own controller
var controller = require('../controllers/config/configChooseController.js');

/* GET call my own controller */
router.get('/', controller.index);

module.exports = router;
