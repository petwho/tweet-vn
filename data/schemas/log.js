var
  mongoose      = require('mongoose'), 
  Schema        = require('mongoose').Schema,
  LogSchema;

LogSchema = new Schema({
  content: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = LogSchema;
