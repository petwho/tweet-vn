define([
  'share/socket', 'jquery', 'backbone', 'spinner',
  'models/question', 'views/question', 'models/answer',
  'text!templates/answer.html',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, $, Backbone, spinner, Question, QuestionView, Answer, answerTpl, skinCSS, contentCSS, contentInlineCSS) {
  var View = Backbone.View.extend({
    el: '#question',

    events: {
      'click .fake-answer-editor': 'initEditor',
      'click .inline-editor-btn .cancel-btn': 'hideEditor',
      'click .inline-editor-btn .submit-btn': 'submit'
    },

    initialize: function () {
      var that = this;
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.question_id = this.$el.data('id');

      socket.on('soketAddedAnswer', function (answer) {
        that.socketAddAnswer(answer);
      });
    },

    template: _.template(answerTpl),

    showEditor: function () {
      $('.fake-editor-wrapper').hide();
      $('.answer-text').removeClass('hidden');
    },

    hideEditor: function () {
      $('.fake-editor-wrapper').show();
      $('.answer-text').addClass('hidden');
    },

    onEditorInit: function (editor) {
      this.editor = editor;
      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);
      this.showEditor();
      $('.fake-answer-editor .light-gray').text('Add your answer');
    },

    initEditor: function () {
      var that = this;

      $('.fake-answer-editor .light-gray').text('Loading...');

      if (this.editor) {
        return this.showEditor();
      }

      tinymce.init({
        setup: function (editor) {
          editor.addButton('h1', {
            title : 'Header 1', // tooltip text seen on mouseover
            icon: "header1",
            image : false,
            onclick : function() {
              editor.execCommand('FormatBlock', false, 'h1');
            }
          });

          editor.on('init', function () {
            that.onEditorInit(editor);
          });
        },
        selector: '#question textarea',
        skin: false,
        plugins: "autolink, autoresize, lists, link, image, anchor, paste",
        toolbar1: "h1 bold italic underline strikethrough hr| bullist numlist | link image",
        paste_as_text: true,
        menubar: false,
        statusbar: false,
        min_height: 50,
        autoresize_min_height: 50,
        autoresize_bottom_margin: 20
      });
    },

    submit: function () {
      var answer, that = this;

      answer = new Answer({
        _csrf: this.csrfToken,
        content: tinyMCE.activeEditor.getContent(),
        question_id: this.question_id
      });

      spinner.start();
      answer.save({}, {
        error: function () {
          spinner.stop();
          that.hideEditor();
        },
        success: function () {
          spinner.stop();
          that.hideEditor();
          tinyMCE.activeEditor.setContent('');
          socket.emit('soketAddedAnswer', answer);
        }
      });
    },

    socketAddAnswer: function (answer) {
      if ($('.answer-item-' + answer._id).length !== 0) {
        return;
      }
      $('.answer-list').append(this.template(answer));
    }
  });

  return View;
});
