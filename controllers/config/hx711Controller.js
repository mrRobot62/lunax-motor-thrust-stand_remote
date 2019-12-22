var hx711Model = require('../../models/config/hx711Model.js');
var {body, validationResult} = require('express-validator');
var {sanitizeBody} = require('express-validator');

var async = require('async');

exports.index = function(req, res) {
   async.parallel({

   }, function(err, results) {
      res.render('index', {title:'FPV Motor Thrust Stand', error:err, data: results});
   });
};
