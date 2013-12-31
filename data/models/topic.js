var mongoose  = require('mongoose'),
  TopicSchema = require('../schemas/topic'),
  Topic       = mongoose.model('Topic', TopicSchema);

module.exports = Topic;
