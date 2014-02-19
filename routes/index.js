var loggedIn, getUnreadNotification;

loggedInIndex = require('./middleware/logged_in_index');
getUnreadNotification = require('./middleware/get_unread_notifications');

module.exports = function (app) {
  app.get('/', [loggedInIndex, getUnreadNotification], function (req, res, next) {
    if (!req.session.user.password) {
      return res.render('users/new_password');
    }
    if (req.session.user.following.topic_ids.length < 5) {
      return res.redirect('/topics/index');
    }
    return res.render('questions_answers/index', {notification_count: req.notification_count});
  });
};
