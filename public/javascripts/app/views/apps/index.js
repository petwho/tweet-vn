define([
  'jquery', 'backbone', 'spinner',
  'collections/questions',  'views/question',
  'collections/answers',    'models/answer',  'views/answer',
], function ($, Backbone, spinner, questions, QuestionView, Answers, Answer, AnswerView) {
  var AppView = Backbone.View.extend({
    el: '#feed-items',

    initialize: function () {
      this.csrfToken  = $('meta[name="csrf-token"]').attr('content');
      this.questions  = questions;
      this.answers    = new Answers;
      this.listenTo(this.questions, 'add',        this.addQuestion);
      this.listenTo(this.answers,   'add',        this.addAnswer);
      this.listenTo(this.questions, 'add:answer', this.answer);
      this.questions.fetch({
        success: function () {
          $('.spinner-large').remove();
        }
      });
      this.answers.fetch();
    },

    addQuestion: function (question) {
      var questionView = new QuestionView({ model: question});
      this.$el.append(questionView.render().el);
    },

    answer: function (questionView) {
      var answer, question;

      question = questionView.model;
      answer = new Answer({
        _csrf       : this.csrfToken,
        question_id : question.get('_id'),
        content     : questionView.editor.getContent()
      });

      answer.save();
    }
  });

  return AppView;
});
