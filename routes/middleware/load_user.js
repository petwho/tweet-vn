var User = require('../../data/models/user');

exports.byRequestEmail = function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) { return next(err); }

    if (user) {
      req.user = user;
      return next();
    }

    return res.json(400, { msg : 'No user was found with the email you provide' });
  });
}

exports.bySession = function (req, res, next) {
  User.findOne({ email: req.session.user.email }, function (err, user) {
    if (err) { return next(err); }

    if (user) {
      req.user = user;
      return next();
    }

    return res.json(400, { msg : 'No user was found with the email you provide' });
  });
}
