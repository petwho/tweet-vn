var loggedIn  = require('./middleware/logged_in.js'),
  Topic       = require('../data/models/topic.js');

module.exports = function (app) {
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

  app.get('/topics/new', loggedIn, function (req, res, next) {
    Topic.find({ is_parent: true }, '_id name').exec(function (err, parents) {
      return res.render('topics/new', { parents: parents });
    });
  });

  app.post('/topics', loggedIn, function (req, res, next) {
    Topic.filterInputs(req.body);

    Topic.findById(req.body.parent, function (err, topic) {
      if (err) { return next(err); }
      if (!topic) {
        req.session.message.error.push('Invalid parent topic.');
        return res.redirect('back');
      }
    });

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
};