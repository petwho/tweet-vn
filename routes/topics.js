var loggedIn = require('./middleware/logged_in'),
  loggedInAjax = require('./middleware/logged_in_ajax'),
  Activity = require('../data/models/activity'),
  Topic = require('../data/models/topic'),
  User = require('../data/models/user'),
  loadTopics = require('./middleware/load_topics'),
  authAdmin = require('./middleware/auth_admin'),
  AWS = require('aws-sdk'),
  request = require('request'),
  fs = require('fs'),
  async = require('async'),
  util = require('util');

module.exports = function (app) {
  app.get('/topics/list', loggedIn, function (req, res, next) {
    Topic.find({}, '-created_at -updated_at')
      .populate({path: 'related_topic_ids', select: '-related_words'})
      .exec(function (err, topics) {
        var i, j;

        if (err) { return next(err); }

        for (i = 0; i < topics.length; i++) {
          if (req.session.user.following.topic_ids.indexOf(topics[i]._id.toString()) !== -1) {
            topics[i].set('is_following', true, {strict: false});
          } else {
            topics[i].set('is_following', false, {strict: false});
          }
          for (j = 0; j < topics[i].related_topic_ids.length; j++) {
            if (req.session.user.following.topic_ids.indexOf(topics[i].related_topic_ids[j]._id.toString()) !== -1) {
              topics[i].related_topic_ids[j].set('is_following', true, {strict: false});
            } else {
              topics[i].related_topic_ids[j].set('is_following', false, {strict: false});
            }
          }
        }

        return res.json(200, topics);
      });
  });

  app.get('/topics/index', loggedIn, function (req, res, next) {
    return res.render('topics/index');
  });

  app.get('/topics/all', [loggedIn, authAdmin], function (req, res, next) {
    Topic.find({}, function (err, topics) {
      if (err) { return next(); }
      res.render('topics/all', {topics: topics});
    });
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

  app.get('/topics/new', [loggedIn, authAdmin, loadTopics.list], function (req, res, next) {
    return res.render('topics/new', { topics : req.topics });
  });

  app.post('/topics', [loggedIn, authAdmin, loadTopics.list], function (req, res, next) {
    var validate_related_topics, create_topic, update_related_topics;

    validate_related_topics = function (next) {
      var i, topic_id_list = [];
      for (i = 0; i < req.topics.length; i++) {
        topic_id_list.push(req.topics[i]._id);
      }

      for (i = 0; i < req.body.related_topic_ids; i++) {
        if (topic_id_list.indexOf(req.body.related_topic_ids[i]) !== -1) {
          req.session.message.error.push('Invalid related topics.');
          return res.redirect('back');
        }
      }
      next();
    };

    create_topic = function (next) {
      Topic.filterInputs(req.body);

      Topic.create(req.body, function (err, topic) {
        var writer;
        if (err) {
          if (err.code === 11000) {
            req.session.message.info.push('Name was already taken.');
            return res.redirect('back');
          }
          return next(err);
        }

        req.topic = topic;

        request({uri: req.body.picture, encoding: 'binary'}, function (err, response, body) {
          var s3;

          AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
          });

          s3 = new AWS.S3();
          s3.client.putObject({
            ACL: process.env.AWS_PUT_OBJECT_ACL,
            Bucket: process.env.AWS_BUCKET_NAME,
            ContentType: 'image/jpeg',
            Key: 'pictures/topics/' + req.body.name.toLowerCase() + '.jpg',
            Body: new Buffer(body, 'binary'),
          }, function (err, data) {
            if (err) { return next(err); }
            next();
          });
        });
      });
    };

    update_related_topics = function (next) {
      if (!req.body.related_topic_ids) {
        return next();
      }
      Topic.update({ _id: { $in: (typeof req.body.related_topic_ids === 'string') ? [req.body.related_topic_ids] : req.body.related_topic_ids } }, { $push: { related_topic_ids: req.topic._id } }, { multi: true}, function (err, numberAffected) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([validate_related_topics, create_topic, update_related_topics], function (err, results) {
      if (err) { return next(err); }
      return res.redirect('/topics/new');
    });
  });

  app.get('/topics/:id/edit', [loggedIn, authAdmin, loadTopics.list], function (req, res, next) {
    Topic.findById(req.params.id, function (err, topic) {
      return res.render('topics/edit', { topic: topic, topics : req.topics });
    });
  });

  app.put('/topics/:id', [loggedIn, authAdmin], function (req, res, next) {
    var rename_file, update_topic;

    Topic.filterInputs(req.body);

    if (!req.body.related_topic_ids || !util.isArray(req.body.related_topic_ids)) {
      req.body.related_topic_ids = [];
    }

    rename_file = function (next) {
      if (!req.body.name) { return next(); }
      Topic.findById(req.params.id, function (err, topic) {
        var s3;
        if (err) { return next(err); }
        if (!topic) { return res.json({msg: 'Invalid topic'}); }

        AWS.config.update({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION
        });

        s3 = new AWS.S3();

        s3.client.copyObject({
          ACL: 'public-read',
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: 'pictures/topics/' + req.body.name.toLowerCase() + '.jpg',
          ContentType: 'image/jpeg',
          CopySource: encodeURIComponent(process.env.AWS_BUCKET_NAME + '/pictures/topics/' + topic.name.toLowerCase() + '.jpg')
        }, function (err, data) {
          if (err) { next(err); }
          s3.client.deleteObject({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'pictures/topics/' + topic.name.toLowerCase() + '.jpg'
          }, function (err, data) {
            if (err) { next(err); }
            next();
          });
        });
      });
    };

    update_topic = function (next) {
      Topic.update({ _id: req.params.id }, req.body, function (err, topic) {
        if (err) { return next(err); }
        next();
      });
    };

    async.series([rename_file, update_topic], function (err, results) {
      if (err) { return next(err); }
      return res.redirect('/topics/all');
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

      topic_id_list = req.session.user.following.topic_ids;
      topic_id_list = topic_id_list.slice(0, topic_id_list.length);
      index = topic_id_list.indexOf(req.body._id);

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
      }).sort({created_at: -1}).exec(function (err, activity) {
        if (err) { return next(err); }
        if (!activity) {
          return res.json(403, {msg: 'Your request was invalid. That"all we know.'});
        }
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