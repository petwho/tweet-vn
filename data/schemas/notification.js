var Schema        = require('mongoose').Schema,
  AnswerSchema    = require('answer'),
  UserSchema      = require('user'),
  QuestionSchema  = require('question'),
  TopicSchema     = require('topic'),
  CommentSchema   = require('comment');

var NotificationSchema = new Schema({
  is_read: Boolean,
  post_modification: {
    user    : { type: Schema.Types.ObjectId, ref: 'User' },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    answer  : { type: Schema.Types.ObjectId, ref: 'Answer' },
    sparse  : true
  },
  suggested_modification_accepted: {
    editor: { type: Schema.Types.ObjectId, ref: 'User' },
    answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
    sparse: true
  },
  new_follower: {
    follower: { type: Schema.Types.ObjectId, ref: 'User' },
    // * if follower followed 'question' created by user but not 'user' --> sparse: true
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    sparse  : true
  },
  new_comment: {
    user_id : { type: Schema.Types.ObjectId, ref: 'User' },
    comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
    sparse  : true
  }
});

module.exports = NotificationSchema;
