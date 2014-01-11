var Schema        = require('mongoose').Schema,
  AnswerSchema    = require('answer'),
  UserSchema      = require('user'),
  QuestionSchema  = require('question'),
  TopicSchema     = require('topic'),
  CommentSchema   = require('comment');

var NotificationSchema = new Schema({
  is_read: Boolean,
  post_modification: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
    question_id : { type: Schema.Types.ObjectId, ref: 'Question' },
    answer_id   : { type: Schema.Types.ObjectId, ref: 'Answer' },
    sparse      : true
  },
  suggested_modification_accepted: {
    user_id   : { type: Schema.Types.ObjectId, ref: 'User' },
    answer_id : { type: Schema.Types.ObjectId, ref: 'Answer' },
    sparse    : true
  },
  new_follower: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' }, // * follower user_id
    // * if follower followed 'question' created by user but not 'user' --> sparse: true
    question_id : { type: Schema.Types.ObjectId, ref: 'Question' },
    sparse  : true
  },
  new_comment: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
    comment_id  : { type: Schema.Types.ObjectId, ref: 'Comment' },
    sparse      : true
  }
});

module.exports = NotificationSchema;
