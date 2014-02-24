// *** BEGIN APPLICATION CONFIGURATION

var  server, dbUrl, facebookSDK,
  express       = require('express'),
  MongoStore    = require('connect-mongo')(express),
  http          = require('http'),
  path          = require('path'),
  app           = express(),
  io            = require('socket.io');

// load configuration file
require('./.config');

if ('development' === process.env.NODE_ENV) {
  app.locals.pretty = true;
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

// connection string
dbUrl = process.env.MONGOLAB_URI;

require('mongoose').connect(dbUrl,  function (err) {
  if (err) {
    console.log('ERROR connecting to: ' + dbUrl + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + dbUrl);
  }
});

// all environments configuration
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(process.env.COOKIE_SECRET));
  app.use(express.session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({ url: dbUrl})
  }));

  // facebook authentication middleware
  facebookSDK = require('facebook-node-sdk');
  app.use(facebookSDK.middleware({ appId: process.env.FACEBOOK_APP_ID, secret: process.env.FACEBOOK_APP_SECRET }));

  // csrf middleware
  app.use(express.csrf());

  app.use(function (req, res, next) {
    app.locals.session    = req.session;
    res.locals.csrfToken  = req.csrfToken();

    req.session.message = req.session.message || { error: [], success: [], info: [] };
    app.locals.message  = req.session.message;

    next();
  });

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// * Begin error handler in production environment
if ('production' === process.env.NODE_ENV) {
  app.use(function (err, req, res, next) {
    if (err.message === 'Forbidden') {
      return res.json({msg: 'forbidden'}, 403);
    }
    res.json({msg: 'server error'}, 500);
  });
  app.use(function (req, res, next) {
    res.render('not_found');
  });
}
// * End error handler in production environment

// Redirect non-www to www
app.all(/.*/, function (req, res, next) {
  if (req.subdomains[0] === undefined) {
    return res.redirect(301, req.protocol + '://www.' + req.get('host') + req.url);
  }
  next();
});

// * Begin load routes
require('./routes/tweets')(app);
require('./routes/index')(app);
require('./routes/sessions')(app);
require('./routes/users')(app);
require('./routes/questions_answers')(app);
require('./routes/questions')(app);
require('./routes/answers')(app);
require('./routes/topics')(app);
require('./routes/activities')(app);
require('./routes/notifications')(app);
require('./routes/search')(app);
// * End load routes

// start server
server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

// ** Begin Socket.IO
io = io.listen(server);

require('./sockets/auth')(io, dbUrl, MongoStore);
require('./sockets/container')(io);
// *** END APPLICATION CONFIGURATION
