var request   = require('request'),
  Schema      = require('mongoose').Schema,
  TopicSchema;

TopicSchema = new Schema({
  name        : { type: String,   required: "Name is required", unique  : true },
  type        : { type: Boolean,  required: true,               default: 0}, // 0: child, 1: parent
  description : String,
  picture     : String,
  count       : Number,
  created_at  : { type: Date, required: true, default: Date.now },
  updated_at  : { type: Date, required: true, default: Date.now }
});

TopicSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

module.exports = TopicSchema;
