var Topic = require('../../data/models/topic'),
  util = require('util');

module.exports = function (req, res, next) {
  var i,
    topic_ids       = [],
    req_topic_ids   = req.body.topic_ids;
  if (!req_topic_ids || !util.isArray(req_topic_ids) || (req_topic_ids.length === 0)) {
    return res.json(400, { msg: 'Invalid topics' });
  }

  Topic.find({}, function (err, topics) {
    if (err) { return next(err); }

    for (i = 0; i < topics.length; i++) {
      topic_ids.push(topics[i]._id.toString());
    }

    for (i = 0; i < req_topic_ids.length; i++) {
      if (topic_ids.indexOf(req_topic_ids[i]) === -1) {
        return res.json(400, { msg: 'Invalid topics' });
      }
    }

    next();
  });
};
