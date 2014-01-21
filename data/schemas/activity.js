var Schema = require('mongoose').Schema,
  User = require('./user'),
  Question = require('./question'),
  Answer = require('./answer'),
  Topic = require('./topic'),
  Comment = require('./comment');

var ActivitySchema = new Schema({
  // (10): vote answer,
  // (20): post question, (21): post answer, (22): post comment
  // (30): follow user, (31): follow question, (32): follow topic
  user_id   : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type      : { type: Number, required: true },
  is_hidden : { type: Boolean, default: false },
  voted     : {
    answer_id: { type: Schema.Types.ObjectId, ref : 'Answer' },
    type     : { type: String, enum: ['up', 'down'] }
  }, // single doc
  posted    : {
    question_id : {type: Schema.Types.ObjectId, ref: 'Question'},
    answer_id   : {type: Schema.Types.ObjectId, ref: 'Answer'},
    comment_id  : {type: Schema.Types.ObjectId, ref: 'Comment'},
    topic_ids   : [{type: Schema.Types.ObjectId, ref: 'Topic'}]
  },
  followed: {
    user_id     : {type: Schema.Types.ObjectId, ref: 'User'},
    question_id : {type: Schema.Types.ObjectId, ref: 'Question'},
    topic_id    : {type: Schema.Types.ObjectId, ref: 'Topic'}
  },
  created_at: { type: Date, default : Date.now }
});

module.exports = ActivitySchema;
