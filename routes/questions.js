var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  loadUser = require('./middleware/load_user'),
  loadTopics = require('./middleware/load_topics'),
  async = require('async'),
  util = require('util'),
  validateTopics = require('./middleware/validate_topics'),
  validateQuestion = require('./middleware/validate_question'),
  updateTitle = require('./middleware/update_question_title'),
  updateTopics = require('./middleware/update_question_topics'),
  Activity = require('../data/models/activity'),
  Question = require('../data/models/question'),
  Topic = require('../data/models/topic'),
  Log = require('../data/models/log'),
  User = require('../data/models/user');

module.exports = function (app) {

  app.get('/open-questions', loggedIn, function (req, res, next) {
    res.render('questions/open');
  });

  app.get('/open-questions/list', loggedIn, function (req, res, next) {
    var scrollcount = (req.query.scrollcount || 0) * 10;

    Question.find({is_open: true, $or: [
      {topic_ids: {$in: req.session.user.following.topic_ids}},
      {_id: {$in: req.session.user.following.question_ids}}
    ]})
      .skip(scrollcount).limit(10).sort({created_at: -1})
      .populate({
        path  : 'topic_ids',
        select: 'name picture follower_count'
      })
      .exec(function (err, questions) {
        return res.json(200, questions);
      });
  });

  app.get('/questions/:id', function (req, res, next) {
    var find_question, question, find_related, related_questions;

    find_question = function (next) {
      Question.findById(req.params.id)
        .populate({ path: 'topic_ids', select: 'name picture follower_count' })
        .populate({ path: 'answer_ids' })
        .exec(function (err, returned_question) {
          if (err) { return next(err); }
          Question.populate(returned_question, [{
            path: 'answer_ids.user_id',
            select: '-email -password -password_salt -token',
            model: 'User'
          }], function (err, returned_question) {
            if (err) { return next(err); }

            question = returned_question;

            if (!question) { return res.redirect('/'); }

            next();
          });
        });
    };

    find_related = function (next) {
      Question.find({ topic_ids: {$in: question.topic_ids} })
        .populate({path: 'topic_ids'})
        .exec(function (err, questions) {
          if (err) { return next(err); }
          related_questions = questions;
          next();
        });
    };

    async.series([find_question, find_related], function (err, results) {
      if (err) { return next(err); }
      res.render('questions/show', {question: question, related_questions: related_questions});
    });
  });

  app.post('/questions', [loggedIn, validateTopics, loadTopics.toObject], function (req, res, next) {
    var create_question, update_user_following, create_activity,
      log_question_details, log_question_title, log_question_topics, add_log_back_to_question,
      logs = [],
      topic_counter = 0;

    create_question = function (next) {
      Question.filterInputs(req.body);

      req.body.user_id = req.session.user._id;
      req.body.follower_ids = [req.session.user._id];
      Question.create(req.body, function (err, question) {
        if (err) { return next(err); }
        req.question = question;
        next();
      });
    };

    update_user_following = function (next) {
      User.update({_id: req.session.user._id}, {$push: {'following.question_ids': req.question._id} })
        .exec(function (err, affected_num, raw) {
          if (err) { return next(err); }
          req.session.user.following.question_ids.push(req.question._id);
          next();
        });
    };

    create_activity = function (next) {
      var activity = new Activity();

      if (req.body.is_hidden === true) { activity.is_hidden = true; }
      activity.user_id = req.session.user._id;
      activity.type = 20;
      activity.posted.question_id = req.question._id;
      activity.posted.topic_ids = req.question.topic_ids;

      activity.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    log_question_title = function (next) {
      var log = new Log();

      log.type = 100;
      log.user_id = req.session.user._id;
      log.question.push(req.question);
      log.content = req.question.title;

      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }
        logs.push(log);
        next();
      });
    };

    log_question_topics = function (next) {
      var log, length = req.question.topic_ids.length;

      if (topic_counter === length) { return next(); }

      log = new Log();

      log.type = 101;
      log.user_id = req.session.user._id;
      log.question.push(req.question);
      log.content = req.topic_obj[req.question.topic_ids[topic_counter]];
      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }

        topic_counter++;
        logs.push(log);
        log_question_topics(next);
      });
    };

    log_question_details = function (next) {
      var log;

      if (!req.question.details) { return next(); }

      log = new Log();

      log.type = 100;
      log.user_id = req.session.user._id;
      log.question.push(req.question);
      log.content = req.question.details;

      log.save(function (err, log, affected_num) {
        if (err) { return next(err); }
        logs.push(log);
        next();
      });
    };

    add_log_back_to_question = function (next) {
      var i;
      for (i = 0; i < logs.length; i++) {
        req.question.log_ids.push(logs[i]._id);
      }
      req.question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([create_question, update_user_following, log_question_title, log_question_topics, log_question_details, add_log_back_to_question, create_activity], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, req.question);
    });
  });

  app.post('/questions/:id/follow', [loggedIn, validateQuestion.byIdParam], function (req, res, next) {
    var update_user, update_question, create_activity;

    update_user = function (next) {
      User.findById(req.session.user._id, function (err, user) {
        var index;
        if (err) { return next(err); }
        if (!user) {
          req.session.destroy();
          return res.json(403, {msg: 'invalid session'});
        }

        index = user.following.question_ids.indexOf(req.params.id);

        if (index === -1) {
          user.following.question_ids.push(req.params.id);

          user.save(function (err, user) {
            if (err) { return next(err); }
            req.session.user = user;
            next();
          });
        } else {
          next();
        }
      });
    };

    update_question = function (next) {
      var index = req.question.follower_ids.indexOf(req.session.user._id);

      if (index === -1) {
        req.question.follower_ids.push(req.session.user._id);
        req.question.save(function (err, question) {
          if (err) { return next(err); }
          next();
        });
      } else {
        next();
      }
    };

    create_activity = function (next) {
      var activity = new Activity();
      activity.user_id = req.session.user._id;
      activity.type = 31;
      activity.followed.question_id = req.question._id;

      activity.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([update_user, update_question, create_activity], function (err, results) {
      if (err) { return next(err); }
      res.json(200, {msg: 'following success'});
    });
  });

  app.post('/questions/:id/unfollow', [loggedIn, validateQuestion.byIdParam], function (req, res, next) {
    var update_user, update_question;

    update_user = function (next) {
      User.findById(req.session.user._id, function (err, user) {
        var index;
        if (err) { return next(err); }
        if (!user) { return res.json(403, {msg: 'user not found'}); }

        index = user.following.question_ids.indexOf(req.params.id);

        if (index !== -1) {
          user.following.question_ids.splice(index, 1);
          user.save(function (err, user) {
            if (err) { return next(err); }
            req.session.user = user;
            next();
          });
        } else {
          next();
        }
      });
    };

    update_question = function (next) {
      var index = req.question.follower_ids.indexOf(req.session.user._id);

      if (index !== -1) {
        req.question.follower_ids.splice(index, 1);
        req.question.save(function (err, question) {
          if (err) { return next(err); }
          next();
        });
      } else {
        next();
      }
    };

    async.series([update_user, update_question], function (err, results) {
      if (err) { return next(err); }
      res.json(200, {msg: 'following success'});
    });
  });

  app.put('/questions', [validateTopics, loggedInAjax], function (req, res, next) {
    switch (req.body.update_type) {
    case 'remove topic':
      updateTopics.remove(req, res, next);
      break;
    case 'add topic':
      updateTopics.add(req, res, next);
      break;
    case 'update title':
      updateTitle(req, res, next);
      break;
    }
  });
};
