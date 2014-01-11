var AnswerSchema,
  Schema      = require('mongoose').Schema,
  LogSchema   = require('./log'),
  VoteSchema  = require('./vote'),
  escapeHtml    = require('escape-html');

AnswerSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  question_id : { type: Schema.Types.ObjectId, ref: 'Question' },
  topic_ids   : [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  log_ids     : [{ type: Schema.Types.ObjectId, ref: 'Log' }],
  vote_ids    : [{ type: Schema.Types.ObjectId, ref: 'Vote' }],

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

AnswerSchema.static('filterInputs', function (reqBody) {
  delete reqBody.user_id;
  delete reqBody.topic_ids;
  delete reqBody.logs;
  delete reqBody.votes;
  delete reqBody.created_at;
  delete reqBody.updated_at;
  // remove script tag from html
  if ((typeof reqBody.content === 'string') && reqBody.content.trim()) {
    reqBody.content = escapeHtml(reqBody.content);
  }
});

module.exports = AnswerSchema;
