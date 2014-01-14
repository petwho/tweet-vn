var loggedIn = require('./middleware/logged_in'),
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
            return res.json(200, activities);
          });
      });
  });
};
