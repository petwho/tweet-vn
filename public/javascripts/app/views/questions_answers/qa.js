// ** Begin single Question view
define([
  'backbone', 'spinner',  'tinymce',
  'text!templates/questions_answers/qa.html'
], function (Backbone, spinner, tinymce, qaTpl) {
  var View = Backbone.View.extend({
    template: _.template(qaTpl),

    events: {
      'click .fake-editor'  : 'onClickFake',
      'click .cancel-btn'   : 'cancel',
      'click .submit-btn'   : 'submit'
    },

    initialize: function () {
    },

    onClickFake: function (e) {
      this.model.trigger('initEditor', this);
    },

    hideFakeEditor: function (self) {
      self.$inlineAnswer.addClass('wide');

      self.$fakeEditor.hide();
      self.$fakeInput.val(self.oldInputText);
    },

    cancel: function () {
      this.$answerText.addClass('hidden');
      this.$inlineAnswer.removeClass('wide');
      this.$fakeEditor.show();
    },

    submit: function () {
      this.model.trigger('submit_answer', this);
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.$('.fake-editor img').attr({ src: $('.user-picture').attr('src') });
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

  return View;
});
