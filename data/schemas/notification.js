var Schema        = require('mongoose').Schema,
  AnswerSchema    = require('answer'),
  UserSchema      = require('user'),
  QuestionSchema  = require('question'),
  TopicSchema     = require('topic'),
  CommentSchema   = require('comment');

var NotificationSchema = new Schema({
  // (10): question edited
  // (11): suggested edit answer
  // (20): answer added to followed question
  // (30): suggested edit answer accepted
  // (31): suggested edit answer discarded
  // (40): new follower
  // (50): new comment
  type        : Number,
  is_read     : { type: Boolean, default: false },
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  log_id      : { type: Schema.Types.ObjectId, ref: 'Log' },
  new_follower: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' }, // * follower user_id
    question_id : { type: Schema.Types.ObjectId, ref: 'Question' }
  },
  new_comment: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
    comment_id  : { type: Schema.Types.ObjectId, ref: 'Comment' }
  }
});

module.exports = NotificationSchema;
