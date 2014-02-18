var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  async = require('async'),
  jsdiff = require('diff'),
  diffEscape = require('./middleware/diff_escape'),
  validateAnswer = require('./middleware/validate_answer'),
  validateQuestion = require('./middleware/validate_question'),
  Activity = require('../data/models/activity'),
  Question = require('../data/models/question'),
  Answer = require('../data/models/answer'),
  Log = require('../data/models/log'),
  Notification = require('../data/models/notification'),
  User = require('../data/models/user');

module.exports = function (app) {
  app.put('/answers', [loggedIn, validateAnswer.is_author], function (req, res, next) {
    var oldContent, update_answer, create_log, add_log_to_answer, find_question, notifiy_followers;
    req.log = {};
    oldContent = req.answer.content;

    update_answer = function (next) {
      Answer.filterInputs(req.body);
      req.answer.content = req.body.content;
      req.answer.save(function (err, answer) {
        if (err) { return next(err); }
        req.answer = answer;
        next();
      });
    };

    create_log = function (next) {
      var diff, raw_diff, oldContentEscape, contentEscape;
      diff = '';
      raw_diff = jsdiff.diffWords(diffEscape(oldContent), diffEscape(req.answer.content));

      raw_diff.forEach(function (part) {
        diff += part.added ? '<span class="added">' + part.value + '</span>' :
            part.removed ? '<span class="removed">' + part.value + '</span>' : part.value;
      });

      req.log.type = 210;
      req.log.user_id = req.session.user._id;
      req.log.answer = req.answer;
      req.log.content = req.answer.content;
      req.log.diff = diff;

      Log.create(req.log, function (err, log) {
        if (err) { return next(err); }
        req.log = log;
        next();
      });
    };

    add_log_to_answer = function (next) {
      req.answer.log_ids = req.log._id;
      req.answer.save(function (err, answer, number_affected) {
        if (err) { return next(err); }
        req.answer = answer;
        next();
      });
    };

    find_question = function (next) {
      Question.findById(req.answer.question_id, function (err, question) {
        if (err) { return next(err); }
        if (!question) { return res.render('error'); }
        req.question = question;
        next();
      });
    };

    notifiy_followers = function (next) {
      var notifiers = [], fn, i;

      for (i = 0; i < req.question.follower_ids.length; i++) {
        if (req.session.user._id === req.question.follower_ids[i].toString()) {
          continue;
        }
        fn = (function (i) {
          return function (next) {
            Notification.create({
              type: 30,
              user_id: req.question.follower_ids[i],
              log_id: req.log
            }, function (err, notification) {
              if (err) { return next(err); }
              next();
            });
          };
        }(i));
        notifiers.push(fn);
      }
      async.parallel(notifiers, function (err, results) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([update_answer, create_log, add_log_to_answer, find_question, notifiy_followers], function (err, resuts) {
      if (err) { return next(err); }
      res.json(200, req.answer);
    });
  });

  app.post('/answers', [loggedIn, validateQuestion.byReqBodyQuestionId, validateAnswer.has_answered], function (req, res, next) {
    var create_answer, add_author_vote, create_log, create_activity,
      add_log_to_answer, update_question, notifiy_followers;

    req.log = {};

    create_answer = function (next) {
      Answer.filterInputs(req.body);

      req.body.user_id    = req.session.user._id;
      req.body.topic_ids  = req.question.topic_ids;

      Answer.create(req.body, function (err, answer) {
        if (err) { return next(err); }
        req.answer = answer;
        next();
      });
    };

    add_author_vote = function (next) {
      req.answer.votes = [{
        user_id: req.session.user._id,
        type: 'upvote'
      }];
      req.answer.save(function (err, answers) {
        if (err) { return next(err); }
        req.answer = answers;
        next();
      });
    };

    create_log = function (next) {
      req.log.type = 200;
      req.log.user_id = req.session.user._id;
      req.log.answer = req.answer;
      req.log.content = req.answer.content;

      Log.create(req.log, function (err, log) {
        if (err) { return next(err); }
        req.log = log;
        next();
      });
    };

    add_log_to_answer = function (next) {
      req.answer.log_ids = req.log._id;
      req.answer.save(function (err, answer, number_affected) {
        if (err) { return next(err); }
        req.answer = answer;
        next();
      });
    };

    update_question = function (next) {
      req.question.is_open = false;
      req.question.log_ids.push(req.log._id);
      req.question.answer_ids.push(req.answer._id);
      req.question.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    create_activity = function (next) {
      var activity = new Activity();

      if (req.body.is_hidden === true) { activity.is_hidden = true; }
      activity.user_id = req.session.user._id;
      activity.type = 21;
      activity.posted.answer_id = req.answer._id;
      activity.posted.topic_ids = req.answer.topic_ids;

      activity.save(function (err, activity) {
        if (err) { return next(err); }
        next();
      });
    };

    notifiy_followers = function (next) {
      var notifiers = [], fn, i;
      for (i = 0; i < req.question.follower_ids.length; i++) {
        fn = (function (i) {
          return function (next) {
            Notification.create({
              type: 20,
              user_id: req.question.follower_ids[i],
              log_id: req.log
            }, function (err, notification) {
              if (err) { return next(err); }
              next();
            });
          };
        }(i));
        notifiers.push(fn);
      }
      async.parallel(notifiers, function (err, results) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([
      create_answer, add_author_vote, create_log, add_log_to_answer,
      update_question, create_activity, notifiy_followers
    ], function (err, results) {
      if (err) { return next(err); }
      Answer.populate(req.answer, [
        {
          path: 'user_id',
          select: '-email -password -password_salt -token',
          model: 'User'
        },
        {
          path: 'topic_ids',
          model: 'Topic'
        }
      ], function (err, answer) {
        if (err) { return next(err); }
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

  app.post('/answers/:id/vote', loggedInAjax, function (req, res, next) {
    var update_answer, update_activity, add_activity, update_user_credit;
    update_answer = function (next) {
      Answer.findById(req.params.id, function (err, answer) {
        var voteIndex, i, vote, is_diff;
        if (err) { return next(err); }

        req.body.type = (req.body.type === 'upvote') ? 'upvote' : 'downvote';

        for (i = 0; i < answer.votes.length; i++) {
          vote = answer.votes[i];
          if (vote.user_id.toString() === req.session.user._id) {
            answer.votes.splice(answer.votes.indexOf(vote), 1);
            is_diff = (vote.type !== req.body.type) ? true : false;
            break;
          }
        }
        if ((is_diff === undefined) || (is_diff === true)) {
          answer.votes.push({
            user_id: req.session.user._id,
            type: req.body.type
          });
        }
        answer.save(function (err, answer) {
          if (err) { return next(err); }
          req.answer = answer;
          next();
        });
      });
    };

    add_activity = function (next) {
      Activity.create({
        is_hidden: (req.body.type === 'downvote') ? true : req.prevActivityStatus ? true : false,
        user_id: req.session.user._id,
        type: 10,
        voted: {
          answer_id: req.answer._id,
          type: req.body.type
        }
      }, function (err, activity) {
        if (err) { return next(err); }
        next();
      });
    };

    update_activity = function (next) {
      Activity.findOne({
        user_id: req.session.user._id,
        type: 10,
        'voted.answer_id': req.answer._id
      }).sort({created_at: -1}).exec(function (err, activity) {
        if (err) { return next(err); }
        if (activity && !(activity.is_hidden)) {
          req.prevActivityStatus = true;
          activity.is_hidden = true;
          activity.save(function (err, question) {
            if (err) { return next(err); }
            add_activity(next);
          });
        } else {
          add_activity(next);
        }
      });
    };

    update_user_credit = function (next) {
      User.findById(req.session.user._id, function (err, user) {
        if (err) { return next(err); }
        if (!user) { req.session.destroy(); return res.json(200, {msg: 'invalid session'}); }
        user.credit = user.credit + 10;
        user.save(function (err, user) {
          if (err) { return next(err); }
          next();
        });
      });
    };
    async.series([update_answer, update_activity, update_user_credit], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, req.answer);
    });
  });
};
