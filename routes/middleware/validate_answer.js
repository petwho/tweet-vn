var Answer = require('../../data/models/answer');

exports.has_answered = function (req, res, next) {
  Answer.findOne({user_id: req.session.user._id, question_id: req.body.question_id}, function (err, answer) {
    if (err) { return next (err); };
    if (answer) {
      return res.json(403, {msg: 'Repeated answer is not allow'});
    }
    next();
  });
};

exports.is_author = function (req, res, next) {
  Answer.findOne({user_id: req.session.user._id, _id: req.body._id}, function (err, answer) {
    if (err) { return next (err); };
    if (!answer) {
      return res.json(403, {msg: 'Only author of answer is allowed for direct edit'});
    }
    req.answer = answer;
    console.log(req.answer)
    next();
  });
};
