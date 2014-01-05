var loggedIn  = require('./middleware/logged_in.js'),
  Topic       = require('../data/models/topic.js');

module.exports = function (app) {
  var sub_topics, loadSubTopics;

  loadSubTopics = function (req, res, next) {
    Topic.find({ is_primary: false }, '_id name').exec(function (err, returned_topics) {
      sub_topics = returned_topics;
      next();
    });
  };

  app.get('/topics/list', loggedIn, function (req, res, next) {
    Topic.find({}, function (err, topics) {
      if (err) { return next(err); }

      return res.json(200, topics);
    });
  });

  app.get('/topics/index', loggedIn, function (req, res, next) {
    return res.render('topics/index');
  });

  app.get('/topics/search', loggedIn, function (req, res, next) {
    Topic.find({name: {$regex: req.query.name, $options: 'i'}}, '_id name picture follower_count').exec(function (err, topics) {
      if (err) { return next(err); }
      res.json(200, topics);
    });
  });

  app.get('/topics/new', [loggedIn, loadSubTopics], function (req, res, next) {
    return res.render('topics/new', { sub_topics : sub_topics });
  });

  app.post('/topics', [loggedIn, loadSubTopics], function (req, res, next) {
    var i,
      topic_id_list = [];

    Topic.filterInputs(req.body);

    // ** Begin validate sub-topics
    for (i = 0; i < sub_topics; i++) {
      topic_id_list.push(sub_topics[i]._id);
    }

    for (i = 0; i < req.body.sub_topics; i++) {
      if (topic_id_list.indexOf(req.body.sub_topics[i]) !== -1) {
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
      return res.render('topics/edit', { topic: topic, sub_topics : sub_topics });
    });
  });

  app.put('/topics/:id', [loggedIn], function (req, res, next) {
    Topic.filterInputs(req.body);

    Topic.update({ _id: req.params.id }, req.body, function (err, topic) {
      if (err) { return next(err); }

      req.session.message.info.push('Good job! :D.<span class="pull-right">Hate to see me? Why not ;-) <strong>-----></strong><span>');
      return res.redirect('/topics/index');
    });
  });
};