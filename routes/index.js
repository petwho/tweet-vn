var loggedIn = require('./middleware/logged_in');

module.exports = function (app) {
  app.get('/', loggedIn, function (req, res, next) {
    return res.render('questions/index');
  });
};
