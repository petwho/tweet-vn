var notLoggedIn = require('./middleware/not_logged_in'),
  loadUser      = require('./middleware/load_user'),
  User          = require('../data/models/user'),
  randomString  = require('./middleware/random_string');

module.exports = function (app) {
  app.post('/users', notLoggedIn, function (req, res, next) {
    User.emailSignUp(req, res, next);
  });

  app.get('/activate/:token', notLoggedIn, function (req, res, next) {
    User.update({'token.activation' : req.params.token}, { $unset : { 'token.activation' : '' } }).exec(function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        req.session.message.error.push('Account was already activated');
        return res.redirect('/login');
      }
      req.session.message.info.push('Account activated successfully');
      res.redirect('/login');
    });
  });

  app.post('/reset-password', loadUser.byRequestEmail, function (req, res, next) {
    User.resetPassword(req, res, next);
  });
};
