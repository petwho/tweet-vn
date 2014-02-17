var Notification = require('../../data/models/notification');

module.exports = function (req, res, next) {
  Notification.find({user_id: req.session.user._id, is_read: false}, function (err, notifications) {
    if (err) { return next(err); }
    req.notification_count = notifications.length;
    next();
  });
};