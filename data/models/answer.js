var mongoose    = require('mongoose'),
  AnswerSchema  = require('../schemas/answer'),
  Answer        = mongoose.model('Answer', AnswerSchema);

module.exports = Answer;
