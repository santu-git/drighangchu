require('dotenv').config();

//System specific
var express         = require('express'),
    expressSession  = require('express-session'),
    path            = require('path'),
    fs              = require('fs'),
    favicon         = require('serve-favicon'),
    mongoStore      = require('connect-mongo')(expressSession),
    logger          = require('morgan'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    passport        = require('passport');

// Craete App
var app = express();

//Application Specific
var config  = require('./config/config'),
    db      = require('./db/mongo').db;

//Bootstarp Models
var modelsPath = path.join(__dirname, './app/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  require(modelsPath + '/' + file);
});

var pass = require('./config/pass');

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(methodOverride());

// express/mongo session storage
app.use(expressSession({
  secret: 'MEAN',
  store: new mongoStore({
    url: config.db[process.env.NODE_ENV],
    collection: 'sessions'
  })
}));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

require('./config/routes')(app);
//app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
