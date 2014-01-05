var TopicSchema,
  request     = require('request'),
  Schema      = require('mongoose').Schema;

TopicSchema = new Schema({
  name            : { type: String,   required: true, unique  : true },
  is_primary      : { type: Boolean,  required: true },
  children        : [{ type: Schema.Types.ObjectId, ref: 'Topics', sparse: true }],
  related_words   : { type: Array },
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
  // capitalize first letter of topic name
  if (req_body.name) {
    req_body.name = req_body.name.charAt(0).toUpperCase() + req_body.name.slice(1);
  }

  // convert related_word into array
  if (req_body.related_words) {
    req_body.related_words = req_body.related_words.split(',');
  }

  delete req_body.follower_count;
  delete req_body.created_at;
  delete req_body.updated_at;
});

module.exports = TopicSchema;
