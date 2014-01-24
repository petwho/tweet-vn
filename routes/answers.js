var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  async = require('async'),
  Activity = require('../data/models/activity'),
  Question = require('../data/models/question'),
  Answer = require('../data/models/answer'),
  Log = require('../data/models/log'),
  User = require('../data/models/user');

module.exports = function (app) {
  app.post('/answers', [loggedIn], function (req, res, next) {
    var create_answer, add_author_vote,    create_log, create_activity,
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

    add_author_vote = function (next) {
      answer.votes = [{
        user_id: req.session.user._id,
        type: 'upvote'
      }];
      answer.save(function (err, returned_answer) {
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
      activity.user_id = req.session.user._id;
      activity.type = 21;
      activity.posted.answer_id = answer._id;
      activity.posted.topic_ids = answer.topic_ids;

      activity.save(function (err, activity) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([
      validate_question, create_answer, add_author_vote, create_log, add_log_to_answer,
      update_question, create_activity
    ], function (err, results) {
      if (err) { return next(err); }
      Answer.populate(answer, [
        {
          path: 'user_id',
          select: '-email -password -password_salt -token -sign_up_type',
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
    var update_anwer, update_activity, add_activity, update_user_credit;
    update_anwer = function (next) {
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
    async.series([update_anwer, update_activity, update_user_credit], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, req.answer);
    });
  });
};
