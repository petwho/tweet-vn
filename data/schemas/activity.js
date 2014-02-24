var Schema = require('mongoose').Schema,
  User = require('./user'),
  Question = require('./question'),
  Answer = require('./answer'),
  Topic = require('./topic'),
  Comment = require('./comment');

var ActivitySchema = new Schema({
  // (10): vote answer, (11): vote tweet
  // (20): post question, (21): post answer, (22): post comment, (23): tweet
  // (30): follow user, (31): follow question, (32): follow topic
  user_id   : { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type      : { type: Number, required: true },
  is_hidden : { type: Boolean, default: false },
  voted     : {
    answer_id: { type: Schema.Types.ObjectId, ref : 'Answer' },
    type     : { type: String, enum: ['upvote', 'downvote'] }
  }, // single doc
  posted    : {
    question_id : {type: Schema.Types.ObjectId, ref: 'Question'},
    answer_id   : {type: Schema.Types.ObjectId, ref: 'Answer'},
    tweet_id    : {type:Schema.Types.ObjectId, ref: 'Tweet'},
    comment_id  : {type: Schema.Types.ObjectId, ref: 'Comment'},
    topic_ids   : [{type: Schema.Types.ObjectId, ref: 'Topic'}]
  },
  followed: {
    user_id     : {type: Schema.Types.ObjectId, ref: 'User'},
    question_id : {type: Schema.Types.ObjectId, ref: 'Question'},
    topic_id    : {type: Schema.Types.ObjectId, ref: 'Topic'}
  },
  created_at: { type: Date, default : Date.now },
  updated_at: { type: Date, default : Date.now }
});

ActivitySchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

module.exports = ActivitySchema;
