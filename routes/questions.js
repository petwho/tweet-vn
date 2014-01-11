var loggedIn  = require('./middleware/logged_in'),
  loadUser    = require('./middleware/load_user'),
  async       = require('async'),
  util        = require('util'),
  Topic       = require('../data/models/topic'),
  Question    = require('../data/models/question'),
  User        = require('../data/models/user');

module.exports = function (app) {
  var validateTopics;

  validateTopics = function (req, res, next) {
    var i,
      topic_ids       = [],
      req_topic_ids   = req.body.topic_ids;
    if (!req_topic_ids || !util.isArray(req_topic_ids)) {
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

    Question.find({}).skip(scrollcount).limit(10)
      .populate({
        path  : 'topics',
        select: 'name picture follower_count'
      })
      .exec(function (err, questions) {
        return res.json(200, questions);
      });
  });

  app.post('/questions', [loggedIn, validateTopics], function (req, res, next) {
    Question.filterInputs(req.body);

    req.body.user_id        = req.session.user._id;
    req.body.follower_ids   = [req.session.user._id];

    Question.create(req.body, function (err, question) {
      if (err) { return next(err); }

      return res.json(question);
    });
  });
};
