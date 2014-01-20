var updateQuestion,
  Question = require('../../data/models/question'),
  Notification = require('../../data/models/notification'),
  Log = require('../../data/models/log'),
  async = require('async');

updateQuestion = function (req, res, next) {
  return function (next) {
    Question.findById(req.body._id, function (err, question) {
      if (err) { return next(err); }

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
};

exports.remove = function (req, res, next) {
  var create_notification, create_log;

  create_log = function (next) {
    Log.create({
      type: 111,
      user_id: req.session.user._id,
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

  async.series([updateQuestion(req, res, next), create_log, create_notification], function (err, results) {
    if (err) { return next(err); }
    res.json(200, req.question);
  });
};

exports.add = function (req, res, next) {
  var create_notification, create_log;

  create_log = function (next) {
    Log.create({
      type: 101,
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

  async.series([updateQuestion(req, res, next), create_log, create_notification], function (err, results) {
    if (err) { return next(err); }
    res.json(200, req.question);
  });
};
