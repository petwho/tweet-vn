var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  Notification = require('../data/models/notification');
module.exports = function (app) {
  app.get('/notifications', loggedIn, function (req, res, next) {
    return res.render('notifications/index');
  });

  app.get('/notifications/list', loggedInAjax, function (req, res, next) {
    Notification.find({user_id: req.session.user._id, is_hidden: false}, function (err, notifications) {
      if (err) { return next(err); }
      res.json(200, notifications);
    });
  });
};