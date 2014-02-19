var getUnreadNotification, loggedInIndex, Question;

loggedInIndex = require('./middleware/logged_in_index');
getUnreadNotification = require('./middleware/get_unread_notifications');
Question = require('../data/models/question');

module.exports = function (app) {
  app.get('/', [loggedInIndex, getUnreadNotification], function (req, res, next) {
    if (!req.session.user.password) {
      return res.render('users/new_password');
    }
    if (req.session.user.following.topic_ids.length < 5) {
      return res.redirect('/topics/index');
    }
    return res.render('questions_answers/index', {notification_count: req.notification_count});
  });

  app.get('/sitemap.xml', function (req, res, next) {
    Question.find({}, function (err, questions) {
      var el_prefix, el_suffix, xml_prefix, xml_suffix, xml;

      el_prefix = '<url><loc>http://www.' + req.get('host') +  '/questions/';
      el_suffix = '</loc><changefreq>always</changefreq></url>';
      xml_prefix = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">';
      xml_suffix = '</urlset>';
      xml = xml_prefix;

      if (err) { return next(err); }

      questions.map(function (question) {
        xml += el_prefix + question._id + el_suffix;
      });
      xml += xml_suffix;
      return res.type('application/xml').send(200, xml);
    });
  });
};
