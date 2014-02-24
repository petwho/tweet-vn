var loggedIn, getUnreadNotification, Activity;

loggedIn = require('./middleware/logged_in');
getUnreadNotification = require('./middleware/get_unread_notifications');
Activity = require('../data/models/activity');

module.exports = function (app) {
  app.get('/questions-answers', [loggedIn, getUnreadNotification], function (req, res, next) {
    return res.render('questions_answers/index', {notification_count: req.notification_count});
  });

  app.get('/questions-answers/list', [loggedIn], function (req, res, next) {
    var scrollcount;

    scrollcount = (req.query.scrollcount || 0) * 10;

    Activity.find({$or: [
      {'posted.topic_ids': {$in: req.session.user.following.topic_ids}},
      {'posted.question_id': {$in: req.session.user.following.question_ids}},
      {'posted.tweet_id': {$in: req.session.user.following.question_ids}}
    ]}).populate('posted.question_id posted.answer_id posted.tweet_id posted.topic_ids')
      .populate({
        path: 'user_id',
        select: '-email -password -password_salt -token',
        model: 'User'
      })
      .skip(scrollcount).limit(10).sort({created_at: -1})
      .exec(function (err, activities) {
        if (err) { return next(err); }

        Activity.populate(activities,
          [
            {
              path: 'posted.answer_id.question_id',
              model: 'Question'
            },
            {
              path: 'posted.answer_id.user_id',
              select: '-email -password -password_salt -token',
              model: 'User'
            }
          ],
          function (err, activities) {
            activities.map(function (activity) {
              if (activity.posted.answer_id) {
                activity.posted.answer_id.votes.map(function (vote) {
                  if ((activity.type !== 'hidden') && (vote.user_id.toString() === req.session.user._id)) {
                    activity.posted.answer_id.set(vote.type, true, {strict: false});
                  }
                });
              }
              if (activity.posted.tweet_id) {
                activity.posted.tweet_id.votes.map(function (vote) {
                  if ((activity.type !== 'hidden') && (vote.user_id.toString() === req.session.user._id)) {
                    activity.posted.tweet_id.set(vote.type, true, {strict: false});
                  }
                });
              }
            });
            return res.json(200, activities);
          });
      });
  });


  app.get('/questions-answers/question/:id', [loggedIn], function (req, res, next) {
    Activity.findOne({ type: 20, 'posted.question_id': req.params.id }).populate('posted.question_id posted.answer_id posted.topic_ids')
      .exec(function (err, activity) {
        if (err) { return next(err); }
        if (!activity) { return res.json(403, {msg: 'No activity found'}); }

        Activity.populate(activity,
          [
            {
              path: 'posted.answer_id.question_id',
              model: 'Question'
            },
            {
              path: 'posted.answer_id.user_id',
              select: '-email -password -password_salt -token',
              model: 'User'
            }
          ],
          function (err, activity) {
            if (activity.posted.answer_id) {
              activity.posted.answer_id.votes.map(function (vote) {
                if ((activity.type !== 'hidden') && (vote.user_id.toString() === req.session.user._id)) {
                  activity.posted.answer_id.set(vote.type, true, {strict: false});
                }
              });
            }
            return res.json(200, activity);
          });
      });
  });

  app.get('/questions-answers/answer/:id', [loggedIn], function (req, res, next) {
    Activity.findOne({ type: 21, 'posted.answer_id': req.params.id }).populate('posted.question_id posted.answer_id posted.topic_ids')
      .exec(function (err, activity) {
        if (err) { return next(err); }
        if (!activity) { return res.json(403, {msg: 'No activity found'}); }

        Activity.populate(activity,
          [
            {
              path: 'posted.answer_id.question_id',
              model: 'Question'
            },
            {
              path: 'posted.answer_id.user_id',
              select: '-email -password -password_salt -token',
              model: 'User'
            }
          ],
          function (err, activity) {
            if (activity.posted.answer_id) {
              activity.posted.answer_id.votes.map(function (vote) {
                if ((activity.type !== 'hidden') && (vote.user_id.toString() === req.session.user._id)) {
                  activity.posted.answer_id.set(vote.type, true, {strict: false});
                }
              });
            }
            return res.json(200, activity);
          });
      });
  });

  app.get('/questions-answers/tweet/:id', [loggedIn], function (req, res, next) {
    Activity.findOne({ type: 23, 'posted.tweet_id': req.params.id }).populate('posted.question_id posted.tweet_id posted.topic_ids')
      .populate({
        path: 'user_id',
        select: '-email -password -password_salt -token',
        model: 'User'
      })
      .exec(function (err, activity) {
        if (err) { return next(err); }
        if (!activity) { return res.json(403, {msg: 'No activity found'}); }

        if (activity.posted.tweet_id) {
          activity.posted.tweet_id.votes.map(function (vote) {
            if ((activity.type !== 'hidden') && (vote.user_id.toString() === req.session.user._id)) {
              activity.posted.tweet_id.set(vote.type, true, {strict: false});
            }
          });
        }
        return res.json(200, activity);
      });
  });
};
