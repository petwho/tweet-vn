var Activity = require('../data/models/activity'),
  loggedIn = require('./middleware/logged_in');

module.exports = function (app) {
  app.get('/activities', loggedIn, function (req, res, next) {
    Activity.find({user_id: {$in: req.session.user.following.user_ids}})
      .populate('voted posted followed')
      .exec(function (err, activities) {
        if (err) { return next(err); }
        return res.render('activities', {activities: activities});
      });
  });  
};
