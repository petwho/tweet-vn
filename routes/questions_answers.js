var loggedIn = require('./middleware/logged_in'),
  Activity = require('../data/models/activity');

module.exports = function (app) {
  app.get('/questions-answers', loggedIn, function (req, res, next) {
    return res.render('questions_answers/index');
  });

  app.get('/questions-answers/list', [loggedIn], function (req, res, next) {
    var scrollcount;

    scrollcount = (req.query.scrollcount || 0) * 10;

    Activity.find({$or: [
      {'posted.topic_ids': {$in: req.session.user.following.topic_ids}},
      {'posted.question_id': {$in: req.session.user.following.question_ids}}
    ]}).populate('posted.question_id posted.answer_id posted.topic_ids')
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
            });
            return res.json(200, activities);
          });
      });
  });
};
