var loggedIn = require('./middleware/logged_in'),
  getHtml = require('./middleware/get_html'),
  Activity = require('../data/models/activity');

module.exports = function (app) {
  app.get('/questions-answers', loggedIn, function (req, res, next) {
    return res.render('questions_answers/index');
  });

  app.get('/questions-answers/list', [loggedIn], function (req, res, next) {
    var scrollcount;

    scrollcount = (req.query.scrollcount || 0) * 10;

    Activity.find({'posted.topic_ids': {$in: req.session.user.following.topic_ids}})
      .populate('posted.question_id posted.answer_id posted.topic_ids')
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
              select: '-email -password -password_salt',
              model: 'User'
            }
          ],
          function (err, activities) {
            activities.map(function (activity) {
              if (activity.posted.question_id) {
                activity.posted.question_id.title = getHtml(activity.posted.question_id.title);
                activity.posted.question_id.detail = getHtml(activity.posted.question_id.detail);
              }

              if (activity.posted.answer_id) {
                activity.posted.answer_id.content = getHtml(activity.posted.answer_id.content);
                console.log( activity.posted.answer_id.content)
              }
            });
            return res.json(200, activities);
          });
      });
  });
};
