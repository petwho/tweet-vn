// ** Begin single Question view
define([
  'backbone', 'spinner',
  'text!templates/question.html'
], function (Backbone, spinner, questionTemplate) {
  var QuestionView = Backbone.View.extend({

    template: _.template($(questionTemplate).html()),

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.find('.fake-input img').attr({ src: $('.user-picture').attr('src') })
      return this;
    }
  });

  return QuestionView;
});
