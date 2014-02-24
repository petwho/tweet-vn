var TweetSchema,
  Schema = require('mongoose').Schema,
  LogSchema = require('./log'),
  escapeHtml = require('escape-html'),
  getHtml = require('../helpers/get_html');

TweetSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  topic_ids   : [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  votes       : [{
    user_id   : { type: Schema.Types.ObjectId, ref: 'User' },
    type      : { type: String, enum: ['upvote', 'downvote'] }
  }],
  title       : { type: String, required: true },
  content     : { type: String, required: true },
  created_at  : { type: Date,   default: Date.now },
  updated_at  : { type: Date,   default: Date.now }
});

TweetSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

TweetSchema.static('filterInputs', function (reqBody) {
  delete reqBody.user_id;
  delete reqBody.votes;
  delete reqBody.created_at;
  delete reqBody.updated_at;
  reqBody.title = escapeHtml(reqBody.title);
  reqBody.content = getHtml(reqBody.content);
});

module.exports = TweetSchema;
