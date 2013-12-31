var mongoose    = require('mongoose'),
  Schema        = mongoose.Schema,
  AnswerSchema  = require('./answer'),
  VoteSchema;

VoteSchema = new Schema({
  user    : { type: mongoose.Schema.Types.ObjectId, ref : 'User' },
  answer  : { type: mongoose.Schema.Types.ObjectId, ref : 'Answer' },
  type    : { type: String, enum: ['+1', '-1'] } // +1: upvote, -1: downvote, 
});

module.exports = VoteSchema;
