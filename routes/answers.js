var loggedIn  = require('./middleware/logged_in'),
  // async       = require('async'),
  Question    = require('../data/models/question'),
  Answer      = require('../data/models/answer'),
  User        = require('../data/models/user');

module.exports = function (app) {
  app.post('/answers', [loggedIn], function (req, res, next) {
    var create_log, create_answer, save_answer_log, save_question_log;

    create_log = function (next) {
      var log;
      log = req.content;
    };
    Answer.filterInputs(req.body);

    req.body.author = req.session.user._id;




    Answer.create(req.body, function (err, answer) {
      if (err) { return next(err); }

      return res.json(200, answer);
    });
  });
};
