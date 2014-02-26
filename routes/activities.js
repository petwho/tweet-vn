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

  app.get('/activities/display', [loggedIn], function (req, res, next) {
    if (req.session.user.email !== process.env.SYS_ADMIN_EMAIL_ADD) {
      return res.render('not_found');
    }
    Activity.find({type: {$in: [20, 21, 23]}}).populate('posted.question_id posted.answer_id posted.tweet_id')
      .exec(function (err, activities) {
        if (err) { return next(err); }
        res.render('activities/display', {activities: activities});
      });
  });

  app.get('/activities/:id/switch', [loggedIn], function (req, res, next) {
    if (req.session.user.email !== process.env.SYS_ADMIN_EMAIL_ADD) {
      return res.render('not_found');
    }
    Activity.findById(req.params.id, function (err, activity) {
      if (err) { return next(err); }
      activity.is_hidden = !activity.is_hidden;
      activity.save(function (err, activity) {
        if (err) { return next(err); }
        return res.redirect('/activities/display');
      })
    });
  });
};
