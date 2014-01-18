var Question = require('../../data/models/question'),
  Notification = require('../../data/models/notification'),
  Log = require('../../data/models/log'),
  async = require('async');

exports.remove = function (req, res, next) {
  var update_question, create_notification, create_log;
  update_question = function (next) {
    Question.findById(req.body._id, function (err, question) {
      if (err) { return next(err); }

      req.question = question;
      question.topic_ids = req.body.topic_ids;

      question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    });
  };

  create_log = function (next) {
    Log.create({
      type: 111,
      user_id: req.question.user_id,
      question: req.question,
      removed_topic_id: req.body.removed_topic_id
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

  async.series([update_question, create_log, create_notification], function (err, results) {
    if (err) { return next(err); }
    res.json(200, {question: req.question});
  });
};
