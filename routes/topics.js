var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  Activity = require('../data/models/activity'),
  Topic = require('../data/models/topic'),
  User = require('../data/models/user'),
  async = require('async'),
  util = require('util');

module.exports = function (app) {
  var subtopics, loadSubTopics;

  loadSubTopics = function (req, res, next) {
    Topic.find({ is_primary: false }, '_id name').exec(function (err, returned_topics) {
      subtopics = returned_topics;
      next();
    });
  };

  app.get('/topics/list', loggedIn, function (req, res, next) {
    setTimeout(function () {
      Topic.find({}, '-created_at -updated_at').exec(function (err, topics) {
        var i, topic_obj, topic_obj_list;
        topic_obj_list = [];

        if (err) { return next(err); }

        for (i = 0; i < topics.length; i++) {
          topic_obj = topics[i].toObject();
          if (req.session.user.following.topic_ids.indexOf(topic_obj._id.toString()) !== -1) {
            topic_obj.is_following = true;
          } else {
            topic_obj.is_following = false;
          }

          topic_obj_list.push(topic_obj);
        }

        return res.json(200, topic_obj_list);
      });
    }, 1000);
  });

  app.get('/topics/index', loggedInAjax, function (req, res, next) {
    return res.render('topics/index');
  });

  app.get('/topics/search', loggedInAjax, function (req, res, next) {
    if (!req.query.name) {
      return res.json(200, {});
    }

    Topic.find({name: {$regex: req.query.name, $options: 'i'}}, '_id name picture follower_count').exec(function (err, topics) {
      if (err) { return next(err); }
      res.json(200, topics);
    });
  });

  app.get('/topics/new', [loggedIn, loadSubTopics], function (req, res, next) {
    return res.render('topics/new', { subtopics : subtopics });
  });

  app.post('/topics', [loggedIn, loadSubTopics], function (req, res, next) {
    var i,
      topic_id_list = [];

    Topic.filterInputs(req.body);

    // ** Begin validate sub-topics
    for (i = 0; i < subtopics; i++) {
      topic_id_list.push(subtopics[i]._id);
    }

    for (i = 0; i < req.body.subtopic_ids; i++) {
      if (topic_id_list.indexOf(req.body.subtopic_ids[i]) !== -1) {
        req.session.message.error.push('Invalid sub-topic.');
        return res.redirect('back');
      }
    }
    // ** End of validate sub-topics

    Topic.create(req.body, function (err, topic) {
      if (err) {
        if (err.code === 11000) {
          req.session.message.info.push('Name was already taken :(. Please, take a new one :D!');
          return res.redirect('back');
        }
        return next(err);
      }

      req.session.message.info.push('Good job! :D.<span class="pull-right">Hate to see me? Why not ;-) <strong>-----></strong><span>');
      return res.redirect('/topics/index');
    });
  });

  app.get('/topics/:id/edit', [loggedIn, loadSubTopics], function (req, res, next) {
    Topic.findById(req.params.id, function (err, topic) {
      return res.render('topics/edit', { topic: topic, subtopics : subtopics });
    });
  });

  app.put('/topics/:id', [loggedIn], function (req, res, next) {
    Topic.filterInputs(req.body);

    if (req.body.subtopic_ids === undefined) {
      req.body.subtopic_ids = [];
    }

    Topic.update({ _id: req.params.id }, req.body, function (err, topic) {
      if (err) { return next(err); }

      req.session.message.info.push('Good job! :D.<span class="pull-right">Hate to see me? Why not ;-) <strong>-----></strong><span>');
      return res.redirect('/topics/index');
    });
  });

  app.put('/topics/:id/follow', loggedIn, function (req, res, next) {
    var validate_topic, update_user, update_activity, create_activity;

    validate_topic = function (next) {
      Topic.findById(req.body._id, function (err, topic) {
        if (err) { return next(err); }

        if (!topic) { return res.json(400, { msg: 'invalid topic' }); }

        next();
      });
    };

    update_user = function (next) {
      var topic_id_list, index;

      topic_id_list  = req.session.user.following.topic_ids;
      topic_id_list  = topic_id_list.slice(0, topic_id_list.length);
      index       = topic_id_list.indexOf(req.body._id);

      if (req.body.is_following === false) {
        if (index === -1) {
          topic_id_list.push(req.body._id);
        }
        req.body.is_following = true;
      } else {
        if (index !== -1) {
          topic_id_list.splice(index, 1);
        }
        req.body.is_following = false;
      }

      User.update({ _id: req.session.user._id }, { 'following.topic_ids': topic_id_list }, function (err, number_affected, raw) {
        if (err) { return next(err); }
        req.session.user.following.topic_ids = topic_id_list;
        next();
      });
    };

    update_activity = function (next) {
      if (req.body.is_following) { return create_activity(next); }
      // update previous followed topic activity to be hidden
      Activity.findOne({
        user_id: req.session.user._id,
        type: 32,
        'followed.topic_id': req.body._id
      }, function (err, activity) {
        if (err) { return next(err); }
        if (!activity) { return res.json(403, {msg: 'invalid topic'}); }
        activity.is_hidden = true;
        activity.save(function (err, activity) {
          if (err) { return next(err); }
          next();
        });
      });
    };

    create_activity = function (next) {
      var activity = new Activity();
      activity.user_id = req.session.user._id;
      activity.type = 32;
      activity.followed.topic_id = req.body._id;

      activity.save(function (err, question) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([ validate_topic, update_user, update_activity ], function (err, results) {
      if (err) { return next(err); }

      return res.json(200, req.body);
    });
  });
};