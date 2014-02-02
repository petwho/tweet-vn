var User = require('../../data/models/user');

exports.byRequestBodyEmail = function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) { return next(err); }

    if (user) {
      req.user = user;
      return next();
    }

    return res.json(400, { msg : 'No user was found with the email you provide.' });
  });
}

exports.byRequestParamUsername = function (req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) { return next(err); }

    if (user) {
      req.user = user;
      return next();
    }

    return res.json(403, { msg : 'Invalid request.' });
  });
}
