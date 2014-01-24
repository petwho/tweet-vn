define([
  'backbone', 'spinner',  'tinymce',
  'text!templates/question/question.html',

], function (Backbone, spinner, tinymce, questionTpl) {
  var QuestionView = Backbone.View.extend({

    template: _.template(questionTpl),

    events: {
      'click .fake-editor'  : 'onClickFake',
      'click .cancel-btn'   : 'cancel',
      'click .submit-btn'   : 'submit'
    },

    initialize: function () {
      this.listenTo(this.model, 'added:answer', this.saveAnswer);
    },

    hideFakeEditor: function (self) {
      self.$inlineAnswer.addClass('wide');

      self.$fakeEditor.hide();
      self.$fakeInput.val(self.oldInputText);
    },

    onClickFake: function (e) {
      this.model.trigger('init_editor', this);
    },

    cancel: function () {
      this.$answerText.addClass('hidden');
      this.$inlineAnswer.removeClass('wide');
      this.$fakeEditor.show();
    },

    submit: function () {
      this.model.trigger('submit_answer', this);
    },

    saveAnswer: function (model) {
      this.$el.remove();
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.afterRender();
      return this;
    },

    afterRender: function () {
      this.$fakeEditor    = this.$('.fake-editor');
      this.$fakeInput     = this.$('.fake-editor input');
      this.$inlineAnswer  = this.$('.inline-answer');
      this.$answerText    = this.$('.answer-text');
      this.oldInputText   = this.$fakeInput.val();
      this.data_editor    = this.$fakeEditor.data('editor');
    }
  });

  return QuestionView;
});
