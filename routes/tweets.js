var loggedIn, loggedInAjax, validateTopics, async, loadTopics, Activity, User, Tweet;

loggedIn = require('./middleware/logged_in');
loggedInAjax = require('./middleware/logged_in_ajax');
validateTopics = require('./middleware/validate_topics');
async = require('async');
loadTopics = require('./middleware/load_topics');
Activity = require('../data/models/activity');
User = require('../data/models/user');
Tweet = require('../data/models/tweet');

module.exports = function (app) {
  app.get('/add-tweet', [loggedIn], function (req, res, next) {
    res.render('tweets/new');
  });

  app.get('/', function (req, res, next) {
    var subdomain = req.subdomains[0];
    if ((subdomain === undefined) || (subdomain === 'www')) {
      return next();
    }
    User.find({}, function (err, users) {
      if (err) { return next(err); }
      users.map(function (user) {
        if (user.username === subdomain) {
          Tweet.find({user_id: user._id}, function (err, tweets) {
            res.json(200, tweets);
          });
        }
      });
    });
  });

  app.post('/tweets/:id/vote', [loggedInAjax], function (req, res, next) {
    var update_tweet, update_activity, add_activity, update_user_credit;
    update_tweet = function (next) {
      Tweet.findById(req.params.id, function (err, tweet) {
        var voteIndex, i, vote, is_diff;
        if (err) { return next(err); }

        req.body.type = (req.body.type === 'upvote') ? 'upvote' : 'downvote';

        for (i = 0; i < tweet.votes.length; i++) {
          vote = tweet.votes[i];
          if (vote.user_id.toString() === req.session.user._id) {
            tweet.votes.splice(tweet.votes.indexOf(vote), 1);
            is_diff = (vote.type !== req.body.type) ? true : false;
            break;
          }
        }
        if ((is_diff === undefined) || (is_diff === true)) {
          tweet.votes.push({
            user_id: req.session.user._id,
            type: req.body.type
          });
        }
        tweet.save(function (err, tweet) {
          if (err) { return next(err); }
          req.tweet = tweet;
          next();
        });
      });
    };

    add_activity = function (next) {
      Activity.create({
        is_hidden: (req.body.type === 'downvote') ? true : req.prevActivityStatus ? true : false,
        user_id: req.session.user._id,
        type: 11,
        voted: {
          tweet_id: req.tweet._id,
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
        type: 11,
        'voted.tweet_id': req.tweet._id
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
    async.series([update_tweet, update_activity, update_user_credit], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, req.tweet);
    });
  });

  app.post('/tweets', [loggedInAjax, validateTopics, loadTopics.toObject], function (req, res, next) {
    var onlyUnique, create_tweet, add_author_vote, add_activity;

    onlyUnique = function (value, index, self) {
      return self.indexOf(value) === index;
    };

    req.body.topic_ids = req.body.topic_ids.filter(onlyUnique);

    create_tweet = function (next) {
      Tweet.filterInputs(req.body);
      if (!req.body.title.trim()) {
        return res.json(403, {msg: 'Invalid title'});
      }
      if (!req.body.content.trim()) {
        return res.json(403, {msg: 'Invalid content'});
      }

      req.body.user_id = req.session.user._id;
      Tweet.create(req.body, function (err, tweet) {
        if (err) { return next(err); }
        req.tweet = tweet;
        next();
      });
    };

    add_author_vote = function (next) {
      req.tweet.votes = [{
        user_id: req.session.user._id,
        type: 'upvote'
      }];
      req.tweet.save(function (err, tweet) {
        if (err) { return next(err); }
        req.tweet = tweet;
        next();
      });
    };

    add_activity = function (next) {
      var activity = new Activity();

      activity.user_id = req.session.user._id;
      activity.type = 23;
      activity.posted.tweet_id = req.tweet._id;
      activity.posted.topic_ids = req.tweet.topic_ids;

      activity.save(function (err, activity) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([create_tweet, add_author_vote, add_activity], function (err, results) {
      if (err) { return next(err); }
      return res.json(200, req.tweet);
    });
  });

  app.get('/tweets/:id', function (req, res, next) {
    Tweet.findById(req.params.id).populate('topic_ids')
      .populate({
        path: 'user_id',
        select: '-email -password -password_salt -token',
        model: 'User'
      })
      .exec(function (err, tweet) {
        var j;
        if (err) { return next(err); }
        if (req.session.user) {
          for (j = 0; j < tweet.votes.length; j++) {
            if (tweet.votes[j].user_id.toString() === req.session.user._id.toString()) {
              tweet.set(tweet.votes[j].type, true, {strict: false});
            }
          }
        }
        return res.render('tweets/show', {tweet: tweet});
      });
  });

  app.get('/tweets/:id/edit', function (req, res, next) {
    Tweet.findById(req.params.id).populate('topic_ids').exec(function (err, tweet) {
      if (err) { return next(err); }
      return res.render('tweets/edit', {tweet: tweet});
    });
  });

  app.put('/tweets', [loggedInAjax, validateTopics, loadTopics.toObject], function (req, res, next) {
    var onlyUnique, find_tweet, update_tweet;


    onlyUnique = function (value, index, self) {
      return self.indexOf(value) === index;
    };

    req.body.topic_ids = req.body.topic_ids.filter(onlyUnique);

    find_tweet = function (next) {
      Tweet.findById(req.body._id, function (err, tweet) {
        if (err) { return next(err); }
        req.tweet = tweet;
        next();
      });
    }

    update_tweet = function (next) {
      Tweet.filterInputs(req.body);
      if (!req.body.title.trim()) {
        return res.json(403, {msg: 'Invalid title'});
      }
      if (!req.body.content.trim()) {
        return res.json(403, {msg: 'Invalid content'});
      }

      req.tweet.topic_ids = req.body.topic_ids;
      req.tweet.title = req.body.title;
      req.tweet.content = req.body.content;

      req.tweet.save(function (err, tweet) {
        if (err) { return next(err); }
        req.tweet = tweet;
        next();
      });
    };

    async.series([find_tweet, update_tweet], function (err, results) {
      if (err) { return next(err); }
      return res.json(220, req.tweet);
    });
  });
};
