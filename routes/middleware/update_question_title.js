var Question = require('../../data/models/question'),
  Notification = require('../../data/models/notification'),
  Log = require('../../data/models/log'),
  async = require('async');

module.exports = function (req, res, next) {
  Question.findById(req.body._id, function (err, question) {
    if (err) { return next(err); }

    question.title = req.body.title;

    question.save(function (err, question) {
      if (err) { return next(err); }
      return res.json(200, question);
    });
  });
};