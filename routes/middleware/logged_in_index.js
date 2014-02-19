module.exports = function (req, res, next) {
  if (!req.session.user) {
    return res.render('sessions/new', {title: "Log in"});
  }
  next();
};