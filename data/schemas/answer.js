var AnswerSchema,
  Schema      = require('mongoose').Schema,
  LogSchema   = require('./log'),
  VoteSchema  = require('./vote');

AnswerSchema = new Schema({
  author      : { type: Schema.Types.ObjectId, ref : 'User' },
  question    : { type: Schema.Types.ObjectId, ref : 'Question' },
  logs        : [LogSchema],
  vote_list   : [VoteSchema],

  content     : { type: String, required: true },
  created_at  : { type: Date,   default: Date.now },
  updated_at  : { type: Date,   default: Date.now }
});

AnswerSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

AnswerSchema.static('sanitizeContent', function (reqBody) {
  // Remove script tag from html
  if (reqBody.content.replace(/(\s|\n)/g, "")) {
    reqBody.content = reqBody.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
});

module.exports = AnswerSchema;
