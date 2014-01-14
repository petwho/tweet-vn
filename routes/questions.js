var loggedIn = require('./middleware/logged_in'),
  loadUser = require('./middleware/load_user'),
  loadTopics = require('./middleware/load_topics'),
  async = require('async'),
  util = require('util'),
  Activity = require('../data/models/activity'),
  Question = require('../data/models/question'),
  Topic = require('../data/models/topic'),
  Log = require('../data/models/log'),
  User = require('../data/models/user');

module.exports = function (app) {
  var validateTopics;

  validateTopics = function (req, res, next) {
    var i,
      topic_ids       = [],
      req_topic_ids   = req.body.topic_ids;
    if (!req_topic_ids || !util.isArray(req_topic_ids) || (req_topic_ids.length === 0)) {
      return res.json(400, { msg: 'Invalid topics' });
    }

    Topic.find({}, function (err, topics) {
      if (err) { return next(err); }

      for (i = 0; i < topics.length; i++) {
        topic_ids.push(topics[i]._id.toString());
      }

      for (i = 0; i < req_topic_ids.length; i++) {
        if (topic_ids.indexOf(req_topic_ids[i]) === -1) {
          return res.json(400, { msg: 'Invalid topics' });
        }
      }

      next();
    });
  };

  app.get('/questions/list', [loggedIn], function (req, res, next) {
    var scrollcount = (req.query.scrollcount || 0) * 10;

    Question.find({ topic_ids: {$in: req.session.user.following.topic_ids} })
      .skip(scrollcount).limit(10)
      .populate({
        path  : 'topic_ids',
        select: 'name picture follower_count'
      })
      .exec(function (err, questions) {
        return res.json(200, questions);
      });
  });

  app.post('/questions', [loggedIn, validateTopics, loadTopics.toObject], function (req, res, next) {
    var create_question, create_activity, question,
      log_question_details, log_question_title, log_question_topics, add_log_back_to_question,
      logs = [],
      topic_counter = 0;

    create_question = function (next) {
      Question.filterInputs(req.body);

      req.body.user_id = req.session.user._id;
      req.body.follower_ids = [req.session.user._id];
      Question.create(req.body, function (err, returned_question) {
        if (err) { return next(err); }
        question = returned_question;
        next();
      });
    };

    create_activity = function (next) {
      var activity = new Activity();

      if (req.body.is_hidden === true) { activity.is_hidden = true; }
      activity.type = 20;
      activity.posted.question_id = question._id;
      activity.posted.topic_ids = question.topic_ids;

      activity.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    log_question_title = function (next) {
      var log = new Log();

      log.type = 100;
      log.user_id = req.session.user._id;
      log.question.push(question);
      log.content = question.title;

      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }
        logs.push(log);
        next();
      });
    };

    log_question_topics = function (next) {
      var log, length = question.topic_ids.length;

      if (topic_counter === length) { return next(); }

      log = new Log();

      log.type = 101;
      log.user_id = req.session.user._id;
      log.question.push(question);
      log.content = req.topic_obj[question.topic_ids[topic_counter]];
      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }

        topic_counter++;
        logs.push(log);
        log_question_topics(next);
      });
    };

    log_question_details = function (next) {
      var log;

      if (!question.details) { return next(); }

      log = new Log();

      log.type = 100;
      log.user_id = req.session.user._id;
      log.question.push(question);
      log.content = question.details;

      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }
        logs.push(log);
        next();
      });
    };

    add_log_back_to_question = function (next) {
      var i;
      for (i = 0; i < logs.length; i++) {
        question.log_ids.push(logs[i]._id);
      }
      question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([create_question, log_question_title, log_question_topics, log_question_details, add_log_back_to_question, create_activity], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, question);
    });
  });
};
