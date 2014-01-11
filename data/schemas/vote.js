var VoteSchema,
  Schema        = require('mongoose').Schema,
  AnswerSchema  = require('./answer');

VoteSchema = new Schema({
  user_id    : { type: Schema.Types.ObjectId, ref : 'User' },
  answer_id  : { type: Schema.Types.ObjectId, ref : 'Answer' },
  type_id    : { type: String, enum: ['+1', '-1'] } // +1: upvote, -1: downvote, 
});

module.exports = VoteSchema;
