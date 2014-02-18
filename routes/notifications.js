var loggedIn, loggedInAjax, getUnreadNotification, async, Notification;

loggedIn = require('./middleware/logged_in');
loggedInAjax = require('./middleware/logged_in_ajax');
getUnreadNotification = require('./middleware/get_unread_notifications');
async = require('async');
Notification = require('../data/models/notification');

module.exports = function (app) {
  app.get('/notifications', [loggedIn, getUnreadNotification], function (req, res, next) {
    return res.render('notifications/index', {notification_count: req.notification_count});
  });

  app.get('/notifications/list', loggedInAjax, function (req, res, next) {
    Notification.find({user_id: req.session.user._id, is_hidden: false})
      .sort({_id: -1}).populate('log_id new_follower.question_id')
      .populate({path: 'new_follower.user_id', select: '-email -password -password_salt -token'})
      .exec(function (err, notifications) {
        if (err) { return next(err); }
        Notification.populate(notifications, [
          { path: 'log_id.user_id', model: 'User', select: '-email -password -password_salt -token' },
          { path: 'log_id.answer.question_id', model: 'Question' },
          { path: 'log_id.added_topic_id', model: 'Topic', select: '-related_words'},
          { path: 'log_id.removed_topic_id', model: 'Topic', select: '-related_words'}
        ], function (err, notifications) {
          return res.json(200, notifications);
        });
      });
  });
};