/**  */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
var analyzeRouter = require('./routes/analyzeStepsRouter');
var configRouter = require('./routes/configChoose');
var changelogRouter = require('./routes/changelog');
var ajax = require('./routes/ajax');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/analyzeSteps', analyzeRouter);
app.use('/configChoose', configRouter);
app.use('/changelog', changelogRouter);
app.post('/ajax', ajax);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// this server listen on port 7000 for user access
const server = app.listen(7000, () => {
  console.log(`This Express is running → PORT ${server.address().port}`);
});

module.exports = app;
