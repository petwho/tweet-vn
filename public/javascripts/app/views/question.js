// ** Begin single Question view
define([
  'backbone', 'spinner',  'tinymce',
  'text!templates/question.html',
  'text!../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (Backbone, spinner, tinymce, questionTemplate, skinCSS, contentCSS, contentInlineCSS) {
  var QuestionView = Backbone.View.extend({

    template: _.template($(questionTemplate).html()),

    events: {
      'click .fake-editor' : 'initEditor'
    },

    afterRender: function () {
      this.$fakeEditor    = this.$('.fake-editor');
      this.$fakeInput     = this.$('.fake-editor input');
      this.$inlineAnswer  = this.$('.inline-answer');
      this.$answerText    = this.$('.answer-text');
      this.oldInputText   = this.$fakeInput.val();
      this.data_editor    = this.$fakeEditor.data('editor');
    },

    onEditorInit: function (self, editor) {
      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.getBody(), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.getBody(), 'style', { type : 'text/css' }, contentInlineCSS);

      self.$inlineAnswer.addClass('wide');

      self.$fakeEditor.hide();
      self.$fakeInput.val(this.oldInputText);

      self.$answerText.removeClass('hidden');
    },

    initEditor: function (e) {
      var that = this;

      this.$fakeInput.val('Loading...');

      tinymce.init({
        setup: function (editor) {
          editor.on('init', function () {
            that.onEditorInit(that, editor);
          });
        },
        selector: 'textarea.eid_' + this.data_editor,
        skin: false,
        plugins: "autolink, autoresize, lists, link, image, anchor, paste",
        toolbar1: "styleselect | bold italic | bullist numlist outdent indent | link image",
        paste_as_text: true,
        menubar: false,
        statusbar: false,
        min_height: 50,
        autoresize_min_height: 50,
        autoresize_bottom_margin: 20
      });
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.$('.fake-editor img').attr({ src: $('.user-picture').attr('src') });
      this.afterRender();
      return this;
    }
  });

  return QuestionView;
});
