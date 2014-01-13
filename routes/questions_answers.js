var loggedIn = require('./middleware/logged_in'),
  Activity = require('../data/models/activity');

module.exports = function (app) {
  app.get('/questions-answers', loggedIn, function (req, res, next) {
    return res.render('questions_answers/index');
  });

  app.get('/questions-answers/list', [loggedIn], function (req, res, next) {
    var scrollcount;

    scrollcount = (req.query.scrollcount || 0) * 10;

    Activity.find({
      $or: {
        'posted.question.topic_ids': {$in: req.session.user.following.topic_ids},
        'posted.answer.topic_ids': {$in: req.session.user.following.topic_ids}
      }
    }).skip(scrollcount).limit(10)
      .exec(function (err, activities) {
        if (err) { return next(err); }
        return req.json(200, activities);
      });
  });
};
