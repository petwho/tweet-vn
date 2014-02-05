module.exports = function (req, res, next) {
  if (req.session.user.email !== process.env.SYS_ADMIN_EMAIL_ADD) {
    return res.render('not_found');
  }
  next();
};
