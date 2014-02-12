var LogSchema,
  Question = require('./question'),
  Answer = require('./answer'),
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  // status code description
  // * (100): added question (title), (101): added question topics, (102): added question details
  // * (110): edited question title, (111): removed question topics, (112): edidited question details
  // * (200): added answer
  // * (210): author edited his/her answer
  // * (211): users suggested edit answer
  // * (220): deleted answer
  // * (300): answer's author accepted suggested edit, (301): answer's author discarded suggested edit
  // * (400): reverted
  type            : { type: Number, required: true },
  user_id         : { type: Schema.Types.ObjectId, ref: 'User' },
  question        : [Question],
  answer          : [Answer],
  diff            : String,
  reverted_to     : { type: Schema.Types.ObjectId, ref: 'Log' },
  reverted_by     : { type: Schema.Types.ObjectId, ref: 'Log' },
  added_topic_id  : { type: Schema.Types.ObjectId, ref: 'Topic' },
  removed_topic_id: { type: Schema.Types.ObjectId, ref: 'Topic' },
  created_at      : { type: Date, default: Date.now }
});

module.exports = LogSchema;
