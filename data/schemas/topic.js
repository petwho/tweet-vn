var TopicSchema,
  request     = require('request'),
  Schema      = require('mongoose').Schema;

TopicSchema = new Schema({
  name             : { type: String,   required: true, unique  : true },
  is_primary       : { type: Boolean,  required: true },
  is_hidden        : {type: Boolean, default: false},
  related_topic_ids: [{ type: Schema.Types.ObjectId, ref: 'Topic', sparse: true }],
  related_words    : Array,
  description      : String,
  follower_count   : { type: Number, default: 0 },
  created_at       : { type: Date, default: Date.now },
  updated_at       : { type: Date, default: Date.now }
});

TopicSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

TopicSchema.static('filterInputs', function (req_body) {
  req_body.is_primary = (req_body.is_primary === 'true') ? true : false;

  // convert related_word into array
  if (req_body.related_words) {
    req_body.related_words = req_body.related_words.split(',');
    req_body.related_words.map(function (word) {
      word = word.trim();
    });
  }

  delete req_body.follower_count;
  delete req_body.created_at;
  delete req_body.updated_at;
});

TopicSchema.virtual('picture').get(function () {
  return 'https://s3-' + process.env.AWS_REGION + '.amazonaws.com/' + process.env.AWS_BUCKET_NAME + '/pictures/topics/' + this.name.toLowerCase() + '.jpg';
});

TopicSchema.set('toJSON', { virtuals: true });

module.exports = TopicSchema;
