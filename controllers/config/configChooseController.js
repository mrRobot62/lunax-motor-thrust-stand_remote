var express = require('express');
var router = express.Router();


var hx711_Model = require('../../models/config/hx711Model.js');
var lipoModel = require('../../models/config/lipoModel.js');
var motorModel = require('../../models/config/motorModel.js');
var propModel = require('../../models/config/propModel.js');
var routesModel = require('../../models/config/routesFilesModel.js');
var runModel = require('../../models/config/runModel.js');
var viewsModel = require('../../models/config/viewsFilesModel.js');

var analyzeStepsController = require('../../controllers/config/analyzeStepsController.js');
var hx711Controller = require('../../controllers/config/hx711Controller.js');
var lipoController = require('../../controllers/config/lipoController.js');
var motorController = require('../../controllers/config/motorController.js');
var propController = require('../../controllers/config/propController.js');
var routesController = require('../../controllers/config/routesFilesController.js');
var runController = require('../../controllers/config/runController.js');
var viewsController = require('../../controllers/config/viewsFilesController.js');


const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

var async = require('async');
const TITLE = 'Configure your motor thrust stand';

exports.index = function(req, res) {
    console.log("configChooseController.index(%s,%s) - Title '%s'",req, res, TITLE);
    async.parallel({
        //
        //
     }, function(err, results) {
        res.render('configChoose', { 
            title: TITLE, 
            error: err, data: results 
        });
    });
};


