var Question = require('../../data/models/question');

exports.byIdParam = function (req, res, next) {
  Question.findById(req.params.id, function (err, question) {
    if (err) { return next(err); }

    if (!question) { return res.json(400, {err: 'invalid question'}); }

    req.question = question;
    next();
  });
};
