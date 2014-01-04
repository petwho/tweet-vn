var request   = require('request'),
  Schema      = require('mongoose').Schema,
  TopicSchema;

TopicSchema = new Schema({
  name            : { type: String,   required: "Name is required", unique  : true },
  type            : { type: Boolean,  required: true }, // 0: child, 1: parent
  description     : String,
  picture         : String,
  follower_count  : Number,
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
