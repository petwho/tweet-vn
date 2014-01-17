var loggedIn  = require('./middleware/logged_in'),
  async       = require('async'),
  getHtml     = require('./helpers/get_html'),
  Activity    = require('../data/models/activity'),
  Question    = require('../data/models/question'),
  Answer      = require('../data/models/answer'),
  Log         = require('../data/models/log'),
  User        = require('../data/models/user');

module.exports = function (app) {
  app.post('/answers', [loggedIn], function (req, res, next) {
    var create_answer,    create_log, create_activity,
      add_log_to_answer,  validate_question,  update_question,
      question,           answer,             log;

    log = {};

    validate_question = function (next) {
      Question.findById(req.body.question_id, function (err, returned_question) {
        if (err) { return next(err); }
        if (!returned_question) { return res.json(400, { msg: 'Invalid question' }); }
        question = returned_question;
        next();
      });
    };

    create_answer = function (next) {
      Answer.filterInputs(req.body);

      req.body.user_id    = req.session.user._id;
      req.body.topic_ids  = question.topic_ids;

      Answer.create(req.body, function (err, returned_answer) {
        if (err) { return next(err); }
        answer = returned_answer;
        next();
      });
    };

    create_log = function (next) {
      log.type = 200;
      log.user_id = req.session.user._id;
      log.answer = answer;
      log.content = req.body.content;

      Log.create(log, function (err, returned_log) {
        if (err) { return next(err); }
        log = returned_log;
        next();
      });
    };

    add_log_to_answer = function (next) {
      answer.log_ids = log._id;
      answer.save(function (err, returned_answer, number_affected) {
        if (err) { return next(err); }
        answer = returned_answer;
        next();
      });
    };

    update_question = function (next) {
      question.is_open = false;
      question.log_ids.push(log._id);
      question.answer_ids.push(answer._id);
      question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    create_activity = function (next) {
      var activity = new Activity();

      if (req.body.is_hidden === true) { activity.is_hidden = true; }
      activity.type = 21;
      activity.posted.answer_id = answer._id;
      activity.posted.topic_ids = answer.topic_ids;

      activity.save(function (err, activity) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([
      validate_question, create_answer, create_log, add_log_to_answer,
      update_question, create_activity
    ], function (err, results) {
      if (err) { return next(err); }
      Answer.populate(answer, [
        {
          path: 'user_id',
          model: 'User'
        },
        {
          path: 'topic_ids',
          model: 'Topic'
        }
      ], function (err, answer) {
        if (err) { return next(err); }
        answer.content = getHtml(answer.content);
        res.json(200, answer);
      });
    });
  });

  app.get('/answers/list', loggedIn, function (req, res, next) {
    var following_topics = req.session.user.following.topics;

    Answer.find({ $in: { topics: following_topics } }, function (err, answers) {
      if (err) { return next(err); }
      res.json(200, err);
    });
  });
};
