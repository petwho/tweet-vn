var Schema        = require('mongoose').Schema;

var NotificationSchema = new Schema({
  // (10): question edited
  // (11): suggested edit answer
  // (20): answer added to followed question
  // (30): author edited his/her answer
  // (31): suggested edit answer accepted
  // (32): suggested edit answer discarded
  // (40): new follower (following user OR following user's question)
  // (50): new comment
  type        : Number,
  is_read     : { type: Boolean, default: false },
  is_hidden   : { type: Boolean, default: false },
  user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
  log_id      : { type: Schema.Types.ObjectId, ref: 'Log' }, // apply for all types except: 40, 50
  new_follower: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' }, // * follower user_id
    question_id : { type: Schema.Types.ObjectId, ref: 'Question' } // * nullable, apply only if follower follows question
  },
  new_comment: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User' },
    comment_id  : { type: Schema.Types.ObjectId, ref: 'Comment' }
  },
  created_at : { type: Date, default: Date.now },
  updated_at : { type: Date, default: Date.now },
});

NotificationSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

module.exports = NotificationSchema;
