define([
  'jquery', 'backbone', 'spinner', 'tinymce',
  'collections/questions_answers',  'views/question_answer',
  'collections/answers',    'models/answer',  'views/answer',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function ($, Backbone, spinner, tinymce, qas, QAView, Answers, Answer, AnswerView, skinCSS, contentCSS, contentInlineCSS) {
  var AppView = Backbone.View.extend({
    el: '#qa-items',

    initialize: function () {
      var that = this;
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.qas = qas;
      this.listenTo(this.qas, 'add', this.addQA);
      this.listenTo(this.qas, 'submit_answer', this.submitAnswer);
      this.listenTo(this.qas, 'added_answer', this.addedAnswer);
      this.listenTo(this.qas, 'initEditor', this.initEditor);
      this.qas.fetch({
        success: function () {
          that.$('.qa-row').removeClass('hidden');
          $('.spinner-large').remove();
        }
      });
    },

    onEditorInit: function (qa, editor) {
      qa.editor = editor;

      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);

      qa.hideFakeEditor(qa);

      qa.$answerText.removeClass('hidden');
    },

    initEditor: function (qa) {
      var that = this;

      qa.$fakeInput.val('Loading...');

      if (qa.editor) {
        qa.hideFakeEditor(qa);
        qa.$answerText.removeClass('hidden');
        return;
      }

      tinymce.init({
        setup: function (editor) {
          editor.on('init', function () {
            that.onEditorInit(qa, editor);
          });
        },
        selector: 'textarea.eid_' + qa.data_editor,
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

    addQA: function (qa) {
      var qaView = new QAView({ model: qa});
      this.$el.append(qaView.render().el);
    },

    submitAnswer: function (qaView) {
      var answer, qa;

      qa = qaView.model;
      answer = new Answer();

      spinner.start();
      answer.save({
        _csrf       : this.csrfToken,
        question_id : qa.get('posted').question_id._id,
        content     : qaView.editor.getContent()
      }, {
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          qa.trigger('added_answer', qa);
        }
      });
    },

    addedAnswer: function () {
      spinner.start();
      this.$('.qa-row').addClass('old');
      this.qas.fetch({
        success: function () {
          this.$('.qa-row.old').remove();
          this.$('.qa-row').removeClass('hidden');
          spinner.stop();
        }
      });
    }
  });

  return AppView;
});
