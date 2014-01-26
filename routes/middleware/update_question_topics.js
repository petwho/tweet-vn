var updateQuestion,
  Question = require('../../data/models/question'),
  Notification = require('../../data/models/notification'),
  Log = require('../../data/models/log'),
  async = require('async');

module.exports = function (req, res, next) {
  var update_question, create_log, create_notification;

  update_question = function (next) {
    Question.findById(req.body._id, function (err, question) {
      if (err) { return next(err); }
      if (!question) { res.json(404, {msg: 'Invalid title'}); }
      question.topic_ids = req.body.topic_ids;

      question.save(function (err, question) {
        if (err) { return next(err); }
        question.populate('topic_ids', function (err, question) {
          if (err) { return next(err); }
          req.question = question;
          next();
        });
      });
    });
  };

  create_log = function (next) {
    var log = new Log();
    log.user_id = req.session.user._id;
    log.question = req.question;
    if (req.body.update_type === 'add topic') {
      log.type = 101;
      log.added_topic_id = req.body.added_topic_id;
    } else {
      log.type = 111;
      log.removed_topic_id = req.body.removed_topic_id;
    }
    log.save(function (err, log) {
      if (err) { return next(err); }
      req.log = log;
      next();
    });
  };

  create_notification = function (next) {
    var notification;

    if (req.session.user._id === req.question.user_id.toString()) {
      return next();
    }

    notification = new Notification();
    Notification.create({
      type: 10,
      user_id: req.question.user_id,
      log_id: req.log._id
    }, function (err, notification) {
      if (err) { return next(err); }
      next();
    });
  };

  async.series([update_question, create_log, create_notification], function (err, results) {
    if (err) { return next(err); }
    res.json(200, req.question);
  });
};
