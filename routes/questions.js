var loggedIn  = require('./middleware/logged_in'),
  loadUser    = require('./middleware/load_user'),
  async       = require('async'),
  Topic       = require('../data/models/topic'),
  Question    = require('../data/models/question'),
  User        = require('../data/models/user');

module.exports = function (app) {
  var validateTopics;

  validateTopics = function (req, res, next) {
    var i,
      topic_id_list       = [],
      topic_list_req   = req.body.topics;
    if (!topic_list_req || (Object.prototype.toString.call(topic_list_req) !== '[object Array]')) {
      return res.json(400, { msg: 'Invalid topics' });
    }

    Topic.find({}, function (err, topics) {
      if (err) { return next(err); }

      for (i = 0; i < topics.length; i++) {
        topic_id_list.push(topics[i]._id.toString());
      }

      for (i = 0; i < topic_list_req.length; i++) {
        if (topic_id_list.indexOf(topic_list_req[i]) === -1) {
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

    req.body.author = req.body.following_list = req.session.user._id;

    Question.create(req.body, function (err, question) {
      if (err) { return next(err); }

      return res.json(question);
    });
  });
};
