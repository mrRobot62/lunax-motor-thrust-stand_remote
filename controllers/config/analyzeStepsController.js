var express = require('express');
var analyzeStepsModel = require('../../models/config/analyzeStepsModel.js');

var async = require('async');

exports.index = function(req, res) {
    console.log("analyzeStepsController.index(%s,%s)",req, res);
    async.parallel({
        //
        //
     }, function(err, results) {
        res.render('analyzeSteps', { 
            title: 'Configure your needed / wanted Analyze Steps', 
            error: err, data: results 
        });
    });
};
