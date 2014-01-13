var Schema        = require('mongoose').Schema,
  Vote = require('./vote'),
  Question = require('./question'),
  Answer = require('./answer'),
  Topic = require('./topic'),
  Comment = require('/comment');

var ActivitySchema = new Schema({
  is_hidden : { type: Boolean, required: true, default: false },
  // 10: vote answer,
  // 20: post question, 21, post answer, 22: post comment
  // 30: follow user, 31: follow question, 32: follow topic
  type      : { type: Number, required: true }
  voted     : [Vote], // single doc
  posted    : {
    question  : [Question], // single doc
    answer    : [Answer], // single doc
    comment   : [Comment] // single doc
  },
  followed: {
    user     : [User], // single doc
    question : [Question], // single doc
    topic    : [Topic] // single doc
  },
  created_at: { type: Date, default : Date.now }
});

module.exports = ActivitySchema;
