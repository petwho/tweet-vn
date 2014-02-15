define([
  'sockets/connect_to_room', 'jquery', 'backbone', 'spinner', 'tinymce',
  'collections/questions_answers', 'views/questions_answers/qa',
  'collections/answers', 'models/answer',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, $, Backbone, spinner, tinymce, qas, QAView, Answers, Answer, skinCSS, contentCSS, contentInlineCSS) {
  var AppView = Backbone.View.extend({
    el: '#qa-items',

    initialize: function () {
      var that = this;
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.userId = this.$el.data('userid');
      this.qas = qas;
      this.qas.scrollCount = 0;
      this.listenTo(this.qas, 'added_question', this.addedQuestion);
      this.listenTo(this.qas, 'add', this.addQA);
      this.listenTo(this.qas, 'submit_answer', this.submitAnswer);
      this.listenTo(this.qas, 'initEditor', this.initEditor);
      this.qas.fetch({
        success: function () {
          that.$('.qa-row').removeClass('hidden');
          $('.spinner-large').css({visibility: 'hidden'});
          setTimeout(function () { that.checkScroll(); }, 500);
        }
      });

      socket.on('soketAddedQuestion', function () {
        that.reRenderFeed(that)();
      });

      socket.on('soketAddedAnswer', function () {
        that.reRenderFeed(that)();
      });

      socket.on('voteAnswer', function (options) {
        that.socketVoteAnswer(that, options);
      });
    },

    events: {
      'click .vote-btns .upvote-with-number': 'upvoteAnswer',
      'click .vote-btns .downvote': 'downvoteAnswer'
    },

    checkScroll: function () {
      var oldLength, pageHeight, scrollDistanceFromBottom, nearBottomOfPage, that;
      oldLength = this.qas.length;
      that = this;
      pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight);
      scrollDistanceFromBottom = pageHeight - (window.pageYOffset + window.innerHeight);
      nearBottomOfPage = scrollDistanceFromBottom - 250;
      if (nearBottomOfPage <= 0) {
        this.qas.scrollCount = this.qas.scrollCount + 1;
        $('.spinner-large').css({visibility: 'visible'});
        this.qas.fetch({
          success: function () {
            that.$('.qa-row').removeClass('hidden');
            $('.spinner-large').css({visibility: 'hidden'});
            if (oldLength !== that.qas.length) {
              setTimeout(function () { that.checkScroll(); }, 500);
            }
          },
          remove: false
        });
      } else {
        setTimeout(function () { that.checkScroll(); }, 500);
      }
    },

    onEditorInit: function (qaView, editor) {
      qaView.editor = editor;

      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);

      qaView.hideFakeEditor(qaView);

      qaView.$answerText.removeClass('hidden');
    },

    initEditor: function (qaView) {
      var that = this;

      qaView.$fakeInput.val('Loading...');

      if (qaView.editor) {
        qaView.hideFakeEditor(qaView);
        qaView.$answerText.removeClass('hidden');
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
            that.onEditorInit(qaView, editor);
          });
        },
        selector: 'textarea.eid_' + qaView.data_editor,
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
        that.$('.qa-row').parent().addClass('old');
        that.qas.reset();
        that.qas.fetch({
          success: function () {
            that.$('.old').remove();
            that.$('.qa-row').removeClass('hidden');
            that.is_rerendering = false;
            spinner.stop();
          }
        });
      };
    },

    upvoteAnswer: function (e) {
      var $currentTarget = $(e.currentTarget),
        $opposite = $currentTarget.parent().find('.downvote'),
        answerId = $currentTarget.data('answerid'),
        that = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/answers/' + answerId + '/vote',
        data: {type: 'upvote', _csrf: that.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          if ($currentTarget.hasClass('voted')) {
            socket.emit('voteAnswer', {answerId: answerId, value: -1, userId: that.userId});
          } else {
            if ($opposite.hasClass('voted')) {
              socket.emit('voteAnswer', {answerId: answerId, value: 2, userId: that.userId});
            } else {
              socket.emit('voteAnswer', {answerId: answerId, value: 1, userId: that.userId});
            }
          }
        }
      });
    },

    downvoteAnswer: function (e) {
      var $currentTarget = $(e.currentTarget),
        $opposite = $currentTarget.parent().find('.upvote-with-number'),
        answerId = $currentTarget.data('answerid'),
        that = this;
      e.preventDefault();
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/answers/' + answerId + '/vote',
        data: {type: 'downvote', _csrf: that.csrfToken },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          if ($currentTarget.hasClass('voted')) {
            socket.emit('voteAnswer', {answerId: answerId, value: 1, userId: that.userId});
          } else {
            if ($opposite.hasClass('voted')) {
              socket.emit('voteAnswer', {answerId: answerId, value: -2, userId: that.userId});
            } else {
              socket.emit('voteAnswer', {answerId: answerId, value: -1, userId: that.userId});
            }
          }
        }
      });
    },

    socketVoteAnswer: function (that, options) {
      var len, $voteText, $number;
      $voteText = that.$('.upvote-with-number[data-answerId="' + options.answerId + '"]').parent();
      $number = $voteText.find('.number');
      $number.text(parseInt($number.text()) + options.value);

      if (that.userId === options.userId) {
        len = $voteText.find('.voted').length;
        $voteText.find('.voted').removeClass('voted');

        if (options.value === 1) {
          if (len === 0) {
            $voteText.find('.upvote-with-number').addClass('voted');
          } else {
            $voteText.find('.downvote').removeClass('voted');
          }
        }

        if (options.value === -1) {
          if (len === 0) {
            $voteText.find('.downvote').addClass('voted');
          } else {
            $voteText.find('.upvote-with-number').removeClass('voted');
          }
        }

        if (options.value === 2) {
          $voteText.find('.upvote-with-number').addClass('voted');
        }
        if (options.value === -2) {
          $voteText.find('.downvote').addClass('voted');
        }
      }
    }
  });

  return AppView;
});
