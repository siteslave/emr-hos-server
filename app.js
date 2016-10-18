'use strict';

require('dotenv').config();

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mysql = require('mysql');

let jwt = require('./models/jwt');

let routes = require('./routes/index');
let login = require('./routes/login');
let api = require('./routes/api');

let app = express();

let hdcPool = mysql.createPool({
  host: process.env.HDC_HOST,
  user: process.env.HDC_USER,
  password: process.env.HDC_PASSWORD,
  database: process.env.HDC_DATABASE,
  port: process.env.HDC_PORT
});

let hosPool = mysql.createPool({
  host: process.env.HOS_HOST,
  user: process.env.HOS_USER,
  password: process.env.HOS_PASSWORD,
  database: process.env.HOS_DATABASE,
  port: process.env.HOS_PORT
});

let authPool = mysql.createPool({
  host: process.env.AUTH_HOST,
  user: process.env.AUTH_USER,
  password: process.env.AUTH_PASSWORD,
  database: process.env.AUTH_DATABASE,
  port: process.env.AUTH_PORT
});

hdcPool.on('connection', (connection) => {
  connection.query('SET NAMES utf8')
});

hosPool.on('connection', (connection) => {
  connection.query('SET NAMES utf8')
});

authPool.on('connection', (connection) => {
  connection.query('SET NAMES utf8')
});

app.use((req, res, next) => {
  req.hosPool = hosPool;
  req.hdcPool = hdcPool;
  req.authPool = authPool;
  next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let authToken = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // console.log(token);
  jwt.verify(token)
    .then((decoded) => {
      req.decoded = decoded;
      next();
    }, err => {
      return res.status(403).send({
        ok: false,
        msg: 'No token provided.'
      });
    });
}

app.use('/', routes);
app.use('/login', login);

app.use('/api/v1', authToken, api);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err)
    next();
    // res.render('error', {
    //   message: err.message,
    //   error: err
    // });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  console.log(err)
  next()
  // res.render('error', {
  //   message: err.message,
  //   error: {}
  // });
});


module.exports = app;
