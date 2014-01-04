var VoteSchema,
  Schema        = require('mongoose').Schema,
  AnswerSchema  = require('./answer');

VoteSchema = new Schema({
  user    : { type: Schema.Types.ObjectId, ref : 'User' },
  answer  : { type: Schema.Types.ObjectId, ref : 'Answer' },
  type    : { type: String, enum: ['+1', '-1'] } // +1: upvote, -1: downvote, 
});

module.exports = VoteSchema;
