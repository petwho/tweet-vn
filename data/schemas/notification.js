var  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  AnswerSchema = require('answer'),
  UserSchema = require('user'),
  QuestionSchema = require('question'),
  TopicSchema = require('topic'),
  CommentSchema = require('comment');

var NotificationSchema = new mongoose.Schema({
  status: Boolean, // 0: Unread, 1: Read
  post_modification: {
    user    : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer  : { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
    sparse  : true
  },
  suggested_modification_accepted: {
    editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
    sparse: true
  },
  new_follower: {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // * if follower followed 'question' created by user but not 'user' --> sparse: true
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    sparse  : true
  },
  new_comment: {
    author  : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment : { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    sparse  : true
  }
});

module.exports = NotificationSchema;
