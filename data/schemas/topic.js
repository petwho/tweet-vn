var TopicSchema,
  request     = require('request'),
  Schema      = require('mongoose').Schema;

TopicSchema = new Schema({
  name            : { type: String,   required: true, unique  : true },
  is_parent       : { type: Boolean,  required: true },
  parent          : { type: Schema.Types.ObjectId, ref: 'Topics', sparse: true },
  description     : String,
  picture         : String,
  follower_count  : { type: Number, default: 0 },
  created_at      : { type: Date, default: Date.now },
  updated_at      : { type: Date, default: Date.now }
});

TopicSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

TopicSchema.static('filterInputs', function (req_body) {
  delete req_body.follower_count;
  delete req_body.created_at;
  delete req_body.updated_at;
});

module.exports = TopicSchema;
