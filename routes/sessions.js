var notLoggedIn = require('./middleware/not_logged_in');

module.exports = function (app) {
  app.get('/login', notLoggedIn, function (req, res, next) {
    res.render('sessions/new', {title: "Log in"});
  });
};