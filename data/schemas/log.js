var LogSchema,
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  author                  : { type: Schema.Types.ObjectId,  ref     : 'User' },
  edited_answer_author    : { type: Schema.Types.ObjectId,  ref     : 'User' },
  content                 : { type: String,                 required: true },
  status: {
    type: String,
    enum: [
      'added', 'edited', 'suggested edit',
      'accepted suggested edit', 'reverted'
    ]
  },
  reverted_revision : { type: Schema.Types.ObjectId,  ref: 'Log' },
  created_at        : { type: Date,                   default: Date.now }
});

module.exports = LogSchema;
