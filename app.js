// *** BEGIN APPLICATION CONFIGURATION

var  server, dbUrl, facebookSDK,
  express     = require('express'),
  MongoStore  = require('connect-mongo')(express),
  http        = require('http'),
  path        = require('path'),
  app         = express(),
  io          = require('socket.io');

// development configuration
if ('development' === app.get('env')) {
  // * note: loading process variables must be performed before
  //          calling any process environment variables
  require('./.config');
  // output pretty html
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
  app.set('port', process.env.PORT || 5000);
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
    app.locals.session  = req.session;
    res.locals.token    = req.csrfToken();
    next();
  });

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

// * Begin error handler in production environment
if ('production' === app.get('env')) {
  app.use(function (err, req, res, next) {
    if (err.message === 'Forbidden') {
      return res.json({error: 'forbidden'}, 403);
    }
    res.json({error: 'server error'}, 5000);
  });
}
// * End error handler in production environment

// * Begin load routes
require('./routes/index')(app);
require('./routes/sessions')(app);
require('./routes/users')(app);
// * End load routes

// start server
server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

// TODO 31-12-2013 - trankhanh : Disable Socket IO

// io = io.listen(server);
// io.of('/following').on('connection', function (socket) {
//   socket.emit('login');
//   socket.on('connectToRoom', function (content) {
//     var topics  = content.topics,
//       users     = content.users,
//       questions = content.questions,
//       i;

//     for (i = 0; i < questions.length; i++) {
//       socket.join('questions_' + questions[i]);
//     }
//     for (i = 0; i < users.length; i++) {
//       socket.join('users_' + users[i]);
//     }
//     for (i = 0; i < topics.length; i++) {
//       socket.join('topics_' + topics[i]);
//     }
//   });

//   // update title of quetsion
//   socket.on('edit_question', function (question_id) {
//     socket.emit('edit_question');
//     socket.broadcast.emit('edit_question');
//     socket.broadcast.to('questions_' + question_id).emit('update_notification');
//   });

//   // update topics of quetsion
//   socket.on('edit_question_topics', function (question_id) {
//     socket.emit('edit_question_topics');
//     socket.broadcast.emit('edit_question_topics');
//   });

// });

// END TODO 31-12-2013 - trankhanh : Disable Socket IO

// *** END APPLICATION CONFIGURATION
