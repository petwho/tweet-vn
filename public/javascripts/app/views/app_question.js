define([
  'jquery', 'underscore', 'backbone',
  'collections/questions',
  'views/question',
], function ($, _, Backbone, Questions, QuestionView) {
  var AppQuestionView = Backbone.View.extend({
    el: '#feed-items',

    initialize: function () {
      this.questions = new Questions;
      this.listenTo(this.questions, 'add', this.addOne);
      this.questions.fetch();
    },

    addOne: function (question) {
      var questionView = new QuestionView({ model: question});
      this.$el.append(questionView.render().el);
    }
  });

  return AppQuestionView;
});
