module.exports = function (io, dbUrl, MongoStore) {
  io.set('authorization', function (data, accept) {
    //** source: http://notjustburritos.tumblr.com/post/22682186189/socket-io-and-express-3
    var sid, sessionStore = new MongoStore({ url: dbUrl});

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
};
