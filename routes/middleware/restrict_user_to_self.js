// dependencies: logged_in.js
exports.byRequestParamUsername = function (req, res, next) {
  if (req.session.user.username !== req.params.username) {
    return res.json({error: 'unauthorized'}, 403);
  } else {
    next();
  }
};

exports.byRequestBodyUsername = function (req, res, next) {
  if (req.session.user.username !== req.body.username) {
    return res.json({error: 'unauthorized'}, 403);
  } else {
    next();
  }
};
