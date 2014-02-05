var User, Question, Answer, Topic;
User = require('../data/models/user');
Question = require('../data/models/question');
Answer = require('../data/models/answer');
Topic = require('../data/models/topic');

module.exports = function (app) {
  app.get('/search', function (req, res, next) {
    Question.find({ title: { $regex: req.query.term, $options: 'i' }}).
      populate('topic_ids').exec(function (err, questions) {
        if (err) { return next(err); }
        res.json(200, questions);
      });
  });
};
