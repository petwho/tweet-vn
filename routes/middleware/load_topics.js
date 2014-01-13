var Topic = require('../../data/models/topic');

exports.toObject = function (req, res, next) {
  Topic.find({}, function (err, topics) {
    var i;
    if (err) { return next(err); }

    req.topic_obj = {};

    for (i = 0; i < topics.length; i++) {
      req.topic_obj[topics[i]._id] = topics[i].name;
    }
    next();
  });
};
