var QuestionSchema,
  Schema = require('mongoose').Schema,
  async = require('async'),
  escapeHtml = require('escape-html'),
  getHtml = require('../helpers/get_html');

QuestionSchema = new Schema({
  log_ids           : [{ type: Schema.Types.ObjectId, ref: 'Log' }],
  answer_ids        : [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
  topic_ids         : [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  follower_ids      : [{ type: Schema.Types.ObjectId, ref: 'User' }],
  user_id           : { type: Schema.Types.ObjectId,  required: true, ref: 'User' },

  title             : { type: String,                 required: true },
  details           : { type: String,                 sparse  : true },

  is_open           : { type: Boolean,  default : true },
  created_at        : { type: Date,     default: Date.now },
  updated_at        : { type: Date,     default: Date.now }
});

QuestionSchema.static('filterInputs', function (reqBody) {
  delete reqBody.log_ids;
  delete reqBody.answer_ids;
  delete reqBody.follower_ids;
  delete reqBody.user_id;
  delete reqBody.status;
  delete reqBody.created_at;
  delete reqBody.updated_at;

  reqBody.title = escapeHtml(reqBody.title);
  reqBody.details = getHtml(reqBody.details);
});

QuestionSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

module.exports = QuestionSchema;
