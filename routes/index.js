var loggedIn = require('./middleware/logged_in');

module.exports = function (app) {
  app.get('/', loggedIn, function (req, res, next) {
    if (req.session.user.following.topics.length < 5) {
      return res.redirect('/topics/index');
    }
    return res.render('questions/index');
  });
};
