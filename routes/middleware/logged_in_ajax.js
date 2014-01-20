module.exports = function (req, res, next) {
  if (!req.session.user) {
    return res.json(403, {msg: 'login required'});
  }
  next();
};