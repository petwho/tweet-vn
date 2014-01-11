var LogSchema,
  Schema = require('mongoose').Schema;

LogSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId,  ref: 'User' },
  // question that is being logged
  question_id : { type: Schema.Types.ObjectId,  ref: 'Question',  sparse: true },
  // answer that is being logged
  answer_id   : { type: Schema.Types.ObjectId,  ref: 'Answer',    sparse: true },
  reverter_id : { type: Schema.Types.ObjectId,  ref: 'Log',       sparse: true },
  reverted_id : { type: Schema.Types.ObjectId,  ref: 'Log',       sparse: true },
  content     : { type: String,                 required: true },
  // status code description
  //  * 1: added      - (for both)
  //  * 2: edited     - (for question) or suggested edits (for answer)
  //  * 3: reverted   - (for both: editor revert their own edits)
  //  * 4: accepted   - (for answer: suggested answer edits)
  //  * 5: discarded  - (for answer: discarded suggested edits)
  status              : { type: Number, required: true },
  created_at          : { type: Date, default: Date.now },
  updated_at          : { type: Date, default: Date.now },
});

module.exports = LogSchema;
