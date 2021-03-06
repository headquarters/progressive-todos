var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var uuid = require('node-uuid');

var routes = require('./routes/index');
var todos = require('./routes/todos');
var lists = require('./routes/lists');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: "sid",
    store: new SQLiteStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 * 24 * 7 // 1 week
    },
    genid: function(req) {
        if(req.query.s) {
            // use session ID in URL when available
            return req.query.s;
        } else {
            return uuid();
        }
    },
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/todo', todos);
app.use('/list', lists);

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

app.listen(3000, function () {
  console.log('App listening on port 3000')
});

module.exports = app;
