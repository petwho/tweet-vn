define([
  'share/socket', 'jquery', 'backbone', 'spinner', 'tinymce',
  'collections/questions',  'views/open_question',
  'collections/answers',    'models/answer',  'views/answer',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, $, Backbone, spinner, tinymce, questions, OpenQuestionView, Answers, Answer, AnswerView, skinCSS, contentCSS, contentInlineCSS) {
  var AppView = Backbone.View.extend({
    el: '#open-questions',

    initialize: function () {
      var that = this;
      this.csrfToken  = $('meta[name="csrf-token"]').attr('content');
      this.questions  = questions;
      this.questions.setOpen(true);
      this.answers    = new Answers();
      this.listenTo(this.questions, 'add',        this.addQuestion);
      this.listenTo(this.questions, 'submit_answer', this.submitAnswer);
      this.listenTo(this.questions, 'init_editor', this.initEditor);

      this.questions.fetch({
        success: function () {
          that.$('.open-question-row').removeClass('hidden');
          $('.spinner-large').remove();
        }
      });

      socket.on('soketAddedQuestion', function () {
        that.reRenderFeed(that)();
      });
      socket.on('soketAddedAnswer', function () {
        that.reRenderFeed(that)();
      });
    },

    addQuestion: function (question) {
      var questionView = new OpenQuestionView({ model: question});
      this.$el.append(questionView.render().el);
    },

    onEditorInit: function (question, editor) {
      question.editor = editor;

      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);

      question.hideFakeEditor(question);

      question.$answerText.removeClass('hidden');
    },

    initEditor: function (question) {
      var that = this;

      question.$fakeInput.val('Loading...');

      if (question.editor) {
        question.hideFakeEditor(question);
        question.$answerText.removeClass('hidden');
        return;
      }

      tinymce.init({
        setup: function (editor) {
          editor.on('init', function () {
            that.onEditorInit(question, editor);
          });
        },
        selector: 'textarea.eid_' + question.data_editor,
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

    submitAnswer: function (questionView) {
      var answer, question;

      question = questionView.model;
      answer = new Answer();

      spinner.start();
      answer.save({
        _csrf       : this.csrfToken,
        question_id : question.get('_id'),
        content     : questionView.editor.getContent()
      }, {
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          socket.emit('soketAddedAnswer', answer);
        }
      });
    },

    reRenderFeed: function (self) {
      var that = self;
      return function () {
        spinner.start();
        if (that.is_rerendering) {
          return setTimeout(that.reRenderFeed(that), 200);
        }
        that.is_rerendering = true;
        that.$('.open-question-row').addClass('old');
        that.questions.fetch({
          success: function () {
            that.$('.open-question-row.old').remove();
            that.$('.open-question-row').removeClass('hidden');
            that.is_rerendering = false;
            spinner.stop();
          }
        });
      };
    }
  });

  return AppView;
});
