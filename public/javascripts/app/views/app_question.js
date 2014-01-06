define([
  'jquery', 'underscore', 'backbone', 'tinymce',
  'collections/questions',
  'views/question',
], function ($, _, Backbone, tinymce, Questions, QuestionView) {
  var AppQuestionView = Backbone.View.extend({
    el: '#feed-items',

    events: {
      'click .fake-input' : 'initEditor'
    },

    initialize: function () {
      this.questions = new Questions;
      this.listenTo(this.questions, 'add', this.addOne);
      this.questions.fetch();
    },

    loadEditor: function (e) {
    },

    addOne: function (question) {
      var questionView = new QuestionView({ model: question});
      this.$el.append(questionView.render().el);
    },

    initEditor: function (e) {
      var fake_editor_id = $(e.currentTarget).data('fake-editor-id');

      tinymce.init({
        setup: function(editor) {
          editor.on('init', function () {
            $(e.currentTarget).hide();
          });
        },
        selector: 'textarea.ec_' + fake_editor_id,
        plugins: ["autolink autoresize lists link image anchor paste"],
        toolbar1: "styleselect | bold italic | bullist numlist outdent indent | link image",
        paste_as_text: true,
        menubar:false,
        statusbar: false,
        min_height: 50,
        autoresize_min_height: 50,
        autoresize_bottom_margin: 10
      });
    }
  });

  return AppQuestionView;
});
