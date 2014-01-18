var LogSchema,
  Question = require('./question'),
  Answer = require('./answer'),
  Log = require('./log'),
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  // status code description
  // * (100): added question (title), (101): added question topics, (102): added question details
  // * (110): edited question title, (111): removed question topics, (112): edidited question details
  // * (200): added answer
  // * (210): suggested edit answer
  // * (220): deleted answer
  // * (310): answer's author accepted suggested edit, (311): answer's author discarded suggested edit
  type            : { type: Number, required: true },
  user_id         : { type: Schema.Types.ObjectId, ref: 'User' },
  question        : [Question],
  answer          : [Answer],
  reverter        : [Log],
  reverted        : [Log],
  content         : String,
  removed_topic_id: { type: Schema.Types.ObjectId, ref: 'Topic' },
  created_at      : { type: Date, default: Date.now }
});

module.exports = LogSchema;
