var AnswerSchema,
  Schema      = require('mongoose').Schema,
  LogSchema   = require('./log'),
  VoteSchema  = require('./vote'),
  escapeHtml    = require('escape-html');

AnswerSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  question    : { type: Schema.Types.ObjectId, ref: 'Question' },
  topics      : [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  logs        : [ LogSchema ],
  votes       : [ VoteSchema ],

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
