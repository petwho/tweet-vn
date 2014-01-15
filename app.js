// *** BEGIN APPLICATION CONFIGURATION

var  server, dbUrl, facebookSDK,
  express       = require('express'),
  MongoStore    = require('connect-mongo')(express),
  http          = require('http'),
  path          = require('path'),
  app           = express(),
  io            = require('socket.io'),
  sessionStore;

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
sessionStore = new MongoStore({ url: dbUrl});

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
    store: sessionStore
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
if ('production' === app.get('env')) {
  app.use(function (err, req, res, next) {
    if (err.message === 'Forbidden') {
      return res.json({msg: 'forbidden'}, 403);
    }
    res.json({msg: 'server error'}, 500);
  });
}
// * End error handler in production environment

// * Begin load routes
require('./routes/index')(app);
require('./routes/sessions')(app);
require('./routes/users')(app);
require('./routes/questions_answers')(app);
require('./routes/questions')(app);
require('./routes/answers')(app);
require('./routes/topics')(app);
// * End load routes

// start server
server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

// ** Begin Socket.IO
io = io.listen(server);
io.set('authorization', function (data, accept) {
  //** source: http://notjustburritos.tumblr.com/post/22682186189/socket-io-and-express-3
  var sid;

  if (!data.headers.cookie) {
    return accept('Session cookie required.', false);
  }

  data.cookie = require('cookie').parse(data.headers.cookie);

  sid = data.cookie['connect.sid'].substr(2, data.cookie['connect.sid'].indexOf('.') - 2);
  data.sessionID = sid;

  sessionStore.get(sid, function (err, session) {
    data.session = session;
    return accept(null, true);
  });
});

io.sockets.on('connection', function (socket) {
  var hs = socket.handshake;

  socket.emit('login');

  socket.on('connectToRoom', function (content) {
    var i, topic_ids, user_ids, question_ids;

    topic_ids = hs.session.user.following.topic_ids;
    user_ids = hs.session.user.following.user_ids;
    question_ids = hs.session.user.following.question_ids;

    for (i = 0; i < topic_ids.length; i++) {
      socket.join('topic_id ' + topic_ids[i]);
    }

    for (i = 0; i < question_ids.length; i++) {
      socket.join('question_id ' + question_ids[i]);
    }

    for (i = 0; i < user_ids.length; i++) {
      socket.join('user_id ' + user_ids[i]);
    }
  });

  socket.on('addedQuestion', function (question) {
    var i;
    socket.emit('addedQuestion');
    for (i = 0; i < question.topic_ids.length; i++) {
      socket.broadcast.to('topic_id ' + question.topic_ids[i]).emit('addedQuestion');
    }
  });

  socket.on('addedAnswer', function (answer) {
    var i;
    socket.emit('addedAnswer');
    for (i = 0; i < answer.topic_ids.length; i++) {
      socket.broadcast.to('topic_id ' + answer.topic_ids[i]).emit('addedAnswer');
    }
  });
});
// *** END APPLICATION CONFIGURATION
