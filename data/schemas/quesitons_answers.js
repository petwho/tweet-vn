var Schema        = require('mongoose').Schema;

var QuestionsAnswersSchema = new Schema({
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  activity_ids: [{ type: Schema.Types.ObjectId, ref: 'Activity' }],
});

module.exports = QuestionsAnswersSchema;
