var notLoggedIn = require('./middleware/not_logged_in'),
  User = require('../data/models/user');

module.exports = function (app) {
  app.post('/users', notLoggedIn, function (req, res, next) {
    User.emailSignUp(req, res, next);
  });
};
