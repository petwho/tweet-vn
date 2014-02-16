var notLoggedIn = require('./middleware/not_logged_in'),
  loggedIn      = require('./middleware/logged_in'),
  async         = require('async'),
  hash          = require('./middleware/secure_pass').hash,
  User          = require('../data/models/user');

module.exports = function (app) {
  app.get('/login', notLoggedIn, function (req, res, next) {
    res.render('sessions/new', {title: "Log in"});
  });

  app.post('/sessions', notLoggedIn, function (req, res, next) {
    var check_email, check_password, check_signup_type, user;

    check_email = function (next) {
      User.findOne({email: req.body.email}, function (err, found_user) {
        if (err) { return next(err); }

        if (!found_user) { return res.json({msg: 'Email was incorrect'}, 403); }

        user = found_user;
        next();
      });
    };

    check_password = function (next) {
      hash(req.body.password, user.password_salt, function (err, hash) {
        if (err) { return next(err); }

        if (hash === user.password) {
          if (req.body.remember === 'true') {
            req.session.cookie.maxAge = 10 * 365 * 24 * 60 * 60;
          }

          if (user.status > 1) {
            req.session.user = user;
            return next();
          }

          return res.json({msg : 'Account is not being activated'}, 403);
        }

        return res.json({msg : 'Password was incorrect'}, 403);
      });
    };

    async.series([check_email, check_password], function (err, results) {
      if (err) { return next(err); }
      return res.json({msg : 'Login success'}, 200);
    });
  });

  app.delete('/sessions', loggedIn, function (req, res, next) {
    req.session.destroy();
    return res.redirect('/login');
  });

  app.get('/logout', loggedIn, function (req, res, next) {
    req.session.destroy();
    return res.redirect('/login');
  });
};