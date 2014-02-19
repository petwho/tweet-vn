define([
  'sockets/connect_to_room', 'jquery', 'backbone', 'spinner', 'tinymce',
  'models/question', 'collections/questions', 'views/open_questions/question',
  'collections/answers', 'models/answer',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, $, Backbone, spinner, tinymce, Question, questions, QuestionView, Answers, Answer, skinCSS, contentCSS, contentInlineCSS) {
  var AppView = Backbone.View.extend({
    el: '#open-questions',

    initialize: function () {
      var that = this;
      this.csrfToken  = $('meta[name="csrf-token"]').attr('content');
      this.questions  = questions;
      this.questions.scrollCount = 0;
      this.questions.setOpen(true);
      this.answers    = new Answers();
      this.listenTo(this.questions, 'add',        this.addQuestion);
      this.listenTo(this.questions, 'submit_answer', this.submitAnswer);
      this.listenTo(this.questions, 'init_editor', this.initEditor);

      this.questions.fetch({
        success: function () {
          $('.spinner-large').css({visibility: 'hidden'});
          setTimeout(function () { that.checkScroll(); }, 500);
        }
      });

      socket.on('soketAddedQuestion', function (question) {
        that.soketAddedQuestion(question);
      });
      socket.on('soketAddedAnswer', function (answer) {
        that.soketAddedAnswer(answer);
      });
    },

    checkScroll: function () {
      var oldLength, pageHeight, scrollDistanceFromBottom, nearBottomOfPage, that;
      oldLength = this.questions.length;
      that = this;
      pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);
      scrollDistanceFromBottom = pageHeight - (window.pageYOffset + window.innerHeight);
      nearBottomOfPage = scrollDistanceFromBottom - 250;
      if (nearBottomOfPage <= 0) {
        this.questions.scrollCount = this.questions.scrollCount + 1;
        $('.spinner-large').css({visibility: 'visible'});
        this.questions.fetch({
          success: function () {
            $('.spinner-large').css({visibility: 'hidden'});
            if (oldLength !== that.questions.length) {
              setTimeout(function () { that.checkScroll(); }, 500);
            }
          },
          remove: false
        });
      } else {
        setTimeout(function () { that.checkScroll(); }, 500);
      }
    },

    addQuestion: function (question) {
      var questionView = new QuestionView({ model: question});
      if (question.get('_prepend')) {
        this.$el.prepend(questionView.render().el);
      } else {
        this.$el.append(questionView.render().el);
      }
    },

    onEditorInit: function (questionView, editor) {
      questionView.editor = editor;

      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);

      questionView.hideFakeEditor(questionView);

      questionView.$answerText.removeClass('hidden');
    },

    initEditor: function (questionView) {
      var that = this;

      questionView.$fakeInput.val('Loading...');

      if (questionView.editor) {
        questionView.hideFakeEditor(questionView);
        questionView.$answerText.removeClass('hidden');
        return;
      }

      tinymce.init({
        setup: function (editor) {
          editor.addButton('h1', {
            title : 'Header 1', // tooltip text seen on mouseover
            icon: "header1",
            image : false,
            onclick : function () {
              editor.execCommand('FormatBlock', false, 'h1');
            }
          });

          editor.on('init', function () {
            that.onEditorInit(questionView, editor);
          });
        },
        selector: 'textarea.eid_' + questionView.data_editor,
        skin: false,
        plugins: "autolink, autoresize, lists, link, image, anchor, paste, youtube",
        toolbar1: "h1 bold italic underline strikethrough hr| bullist numlist | link image | youtube",
        extended_elements: "iframe[src|title|width|height|allowfullscreen|frameborder]",
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

    soketAddedQuestion: function (question) {
      var that = this;
      $.ajax({
        type: 'GET',
        url: '/open-questions/list/' + question._id,
        success: function (question) {
          var new_question;
          if (that.questions.findWhere({_id: question._id}) === undefined) {
            question._prepend = true;
            new_question = new Question(question);
            that.questions.add(new_question);
          }
        },
        error: function () {
          window.location.href = '/open-questions';
        }
      });
    },

    soketAddedAnswer: function (answer) {
      var question = this.questions.findWhere({_id: answer.question_id.toString()});
      if (question) {
        question.trigger('soketAddedAnswer');
        this.questions.remove(question);
      }
    },

    reRenderFeed: function (self) {
      var that = self;
      return function () {
        spinner.start();
        if (that.is_rerendering) {
          return setTimeout(that.reRenderFeed(that), 200);
        }
        that.is_rerendering = true;
        that.$('.open-question-row').parent().addClass('old');
        that.questions.reset();
        that.questions.fetch({
          success: function () {
            that.$('.old').remove();
            that.is_rerendering = false;
            spinner.stop();
          }
        });
      };
    }
  });

  return AppView;
});
