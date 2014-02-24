var Activity, loggedIn, getUnreadNotification;

Activity = require('../data/models/activity');
loggedIn = require('./middleware/logged_in');
getUnreadNotification = require('./middleware/get_unread_notifications');

module.exports = function (app) {
  app.get('/activities/list', loggedIn, function (req, res, next) {
    Activity.find({$and: [{
        user_id: {$in: req.session.user.following.user_ids},
        is_hidden: false
      }]}).sort({created_at: -1})
      .populate('posted.question_id posted.answer_id posted.tweet_id voted.answer_id followed.user_id followed.question_id followed.topic_id')
      .populate({path: 'user_id', select: '_id first_name last_name username picture sign_up_type'})
      .exec(function (err, activities) {
        Activity.populate(activities, [
          { path: 'posted.answer_id.question_id', model: 'Question'},
          { path: 'voted.answer_id.question_id', model: 'Question' },
          { path: 'voted.answer_id.topic_ids',model: 'Topic' }
        ], function (err, activities) {
          if (err) { return next(err); }
          return res.json(200, activities);
        });
      });
  });

  app.get('/activities', [loggedIn, getUnreadNotification], function (req, res, next) {
    return res.render('activities/index', {notification_count: req.notification_count});
  });
};
