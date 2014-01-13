var LogSchema,
  User = require('./user'),
  Question = require('./question'),
  Answer = require('./answer'),
  Log = require('./log'),
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  // status code description
  // * (100): added question (title), (101): added question topics, (102): added question details
  // * (110): edited question title, (111): edidited question topics, (112): edidited question details
  // * (200): added answer
  // * (210): suggested edit answer
  // * (310): answer's author accepted suggested edit, (311): answer's author discarded suggested edit
  type    : { type: Number, required: true },
  user    : [User], // single embedded doc
  // question that is being logged
  question: [Question], // single embedded doc
  // answer that is being logged
  answer  : [Answer], // single embedded doc
  reverter: [Log], // single embedded doc
  reverted: [Log], // single embedded doc
  content : { type: String, required: true },
  created_at          : { type: Date, default: Date.now },
  updated_at          : { type: Date, default: Date.now }
});

module.exports = LogSchema;
