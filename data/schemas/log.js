var LogSchema,
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  content   : String,
  created_at: { type: Date, default: Date.now }
});

module.exports = LogSchema;
