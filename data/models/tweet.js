var mongoose  = require('mongoose'),
  TweetSchema = require('../schemas/tweet'),
  Tweet       = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
