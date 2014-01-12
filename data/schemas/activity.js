var Schema        = require('mongoose').Schema;

var ActivitySchema = new Schema({
  is_hidden : { type: Boolean, required: true, default: false },
  // 10: vote answer,
  // 20: post question, 21, post answer, 22: post comment
  // 30: follow user, 31: follow question, 32: follow topic
  type    : { type: Number, required: true }
  vote_id : { type: Schema.Types.ObjectId, ref: 'Vote', sparse: true },
  post    : {
    question_id  : { type: Schema.Types.ObjectId, ref: 'Question', sparse: true },
    answer_id    : { type: Schema.Types.ObjectId, ref: 'Answer', sparse: true },
    comment_id   : { type: Schema.Types.ObjectId, ref: 'Comment', sparse: true }
  },
  follow: {
    user_id     : { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    question_id : { type: Schema.Types.ObjectId, ref: 'Question', sparse: true },
    topic_id    : { type: Schema.Types.ObjectId, ref: 'Topic', sparse: true }
  },
  created_at: { type: Date,        default : Date.now }
});

module.exports = ActivitySchema;
