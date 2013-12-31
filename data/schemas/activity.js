var Schema        = require('mongoose').Schema,
  AnswerSchema    = require('answer'),
  UserSchema      = require('user'),
  QuestionSchema  = require('question'),
  TopicSchema     = require('topic'),
  VoteSchema      = require('vote'),
  CommentSchema   = require('comment');

var ActivitySchema = new Schema({
  vote: [VoteSchema], // * contain a single document
  post: {
    question  : [QuestionSchema], // * contain a single document
    answer    : [AnswerSchema],   // * contain a single document
    comment   : [CommentSchema]   // * contain a single document
  },
  // * all keys within follow field contain a single document
  follow      : { user: [UserSchema],  question: [QuestionSchema], topics: [TopicSchema] },
  created_at  : { type: Date,        default : Date.now }
});

module.exports = ActivitySchema;
