var express = require('express');
var router = express.Router();



/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('changelog', { 
        title: 'Changelog'
    });  
});


module.exports = router;
