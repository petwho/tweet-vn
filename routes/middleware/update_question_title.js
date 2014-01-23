var Question = require('../../data/models/question'),
  Notification = require('../../data/models/notification'),
  Log = require('../../data/models/log'),
  async = require('async');

module.exports = function (req, res, next) {
  var update_question_title, create_log, create_notification;

  update_question_title = function (next) {
    Question.findById(req.body._id, function (err, question) {
      if (err) { return next(err); }

      question.title = req.body.title;

      question.save(function (err, question) {
        if (err) { return next(err); }
        req.question = question;
        next();
      });
    });
  };

  create_log = function (next) {
    Log.create({
      type: 110,
      user_id: req.session.user._id,
      question: req.question,
      added_topic_id: req.body.removed_topic_id
    }, function (err, log) {
      if (err) { return next(err); }
      req.log = log;
      next();
    });
  };

  create_notification = function (next) {
    var notification = new Notification();
    Notification.create({
      type: 10,
      user_id: req.session.user._id,
      log_id: req.log._id
    }, function (err, notification) {
      if (err) { return next(err); }
      next();
    });
  };

  async.series([update_question_title, create_log, create_notification], function (err, results) {
    if (err) { return next(err); }
    return res.json(200, req.question);
  });
};