var mongoose      = require('mongoose'),
  QuestionSchema  = require('../schemas/question'),
  Question        = mongoose.model('Question', QuestionSchema);

module.exports = Question;
