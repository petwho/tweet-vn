define([
  'sockets/connect_to_room', 'jquery', 'backbone', 'spinner',
  'models/question', 'views/question/question', 'models/answer',
  'text!templates/banner_msg.html',
  'text!templates/question/search_results.html',
  'text!templates/question/answer.html',
  'text!templates/question/topic.html',
  'text!../../../vendor/tinymce/skins/lightgray/skin.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.min.css',
  'text!../../../vendor/tinymce/skins/lightgray/content.inline.min.css'
], function (socket, $, Backbone, spinner, Question, QuestionView, Answer, bannerMsgTpl, searchTemplate, answerTpl, topicTpl, skinCSS, contentCSS, contentInlineCSS) {
  var View = Backbone.View.extend({
    el: '#question',

    events: {
      'click .fake-answer-editor': 'initEditor',
      'keyup .topic-selector > input' : 'searchTopic',
      'click .answer-text .inline-editor-btn .cancel-btn': 'hideEditor',
      'click .answer-text .inline-editor-btn .submit-btn': 'submitAnswer',
      'click .manage-answer-btns .edit': 'editAnswer',
      'click .edit-answer-text .cancel-btn': 'cancelEditAnswer',
      'click .edit-answer-text .submit-btn': 'saveEditAnswer',
      'click .follow-btn.follow-question': 'followQuestion',
      'click .unfollow-btn.unfollow-question': 'unfollowQuestion',
      'click button.remove-topic': 'removeTopic',
      'click .search-results .seach-topic-item': 'addTopic',
      'click .edit-title-actions .submit-btn': 'saveEditingTitle',
      'click .vote-btns .upvote-with-number': 'upvoteAnswer',
      'click .vote-btns .downvote': 'downvoteAnswer'
    },

    initialize: function () {
      var topic_ids, that = this;

      topic_ids = $('#question .topic-item a').map(function () {
        return $(this).data('id');
      }).get();

      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.userId = this.$el.data('user-id');
      this.question_id = this.$el.data('id');
      this.$titleHeader = this.$('.title-text h1.title');
      this.$topicList = this.$('.topic-list');
      this.$searchInput = this.$('.search-box input');
      this.$searchResults = this.$('.search-results');
      this.question = new Question({
        _csrf: this.csrfToken,
        _id: this.question_id,
        title: this.$titleHeader.text(),
        topic_ids: topic_ids
      });
      this.$bannerMsg = $('.banner-msg');

      socket.on('soketAddedAnswer', function (answer) {
        that.socketAddAnswer(answer);
      });

      socket.on('socketEditQuestionTopics', function (data) {
        that.resetQuestionTopics(data);
        that.reRenderTopics(that)(data);
      });

      socket.on('socketEditQuestionTitle', function (data) {
        that.resetQuestionTitle(data);
        that.reRenderTitle(that)(data);
      });

      socket.on('voteAnswer', function (options) {
        that.socketVoteAnswer(that, options);
      });
    },

    template: _.template(answerTpl),


    resetQuestionTopics: function (data) {
      var i, topic_ids = [], topic_objects = data.topic_ids;
      for (i = 0; i < topic_objects.length; i++) {
        topic_ids.push(topic_objects[i]._id);
      }
      this.question.set('topic_ids', topic_ids);
    },

    resetQuestionTitle: function (data) {
      this.question.set('title', data.title);
    },

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
            onclick : function () {
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

    submitAnswer: function () {
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

    showEditAnswerEditor: function () {
      this.$('.' + this.answerTextClass).hide();
      this.$('.manage-answer-btns .edit').text('edit');
      $('.manage-answer-btns').hide();
      $('.edit-answer-text').removeClass('hidden');
    },

    onEditAnswerEditorInit: function (editor) {
      this.editAnswerEditor = editor;
      if ($('head style[name="tinymce"]').length === 0) {
        $('head').append('<style name="tinymce">' + skinCSS + '</style>');
      }
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentCSS);
      tinyMCE.activeEditor.dom.add(tinyMCE.activeEditor.dom.select('head'), 'style', { type : 'text/css' }, contentInlineCSS);
      this.showEditAnswerEditor();
      $('.fake-answer-editor .light-gray').text('Add your answer');
    },

    editAnswer: function (e) {
      var that = this;
      this.answerTextClass = $(e.currentTarget).data('text-class');
      this.$('.manage-answer-btns .edit').text('Loading...');

      if (this.editAnswerEditor) {
        return this.showEditAnswerEditor();
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
            that.onEditAnswerEditorInit(editor);
          });
        },
        selector: '.edit-answer-text textarea',
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

    cancelEditAnswer: function () {
      $('.' + this.answerTextClass).show();
      $('.manage-answer-btns').show();
      $('.edit-answer-text').addClass('hidden');
    },

    saveEditAnswer: function (e) {
      var answer, that = this;
      answer = new Answer({
        _id: $(e.currentTarget).data('answer-id'),
        _csrf: this.csrfToken,
        content: tinyMCE.activeEditor.getContent()
      });

      spinner.start();
      answer.save({}, {
        error: function () {
          spinner.stop();
          that.cancelEditAnswer();
        },
        success: function () {
          spinner.stop();
          $('.' + that.answerTextClass + ' .answer-content').html(answer.get('content'));
          that.cancelEditAnswer();
          tinyMCE.activeEditor.setContent('');
        }
      });
    },

    socketAddAnswer: function (answer) {
      // check if answer was already append
      if ($('.answer-item-' + answer._id).length !== 0) {
        return;
      }
      $('.answer-list').append(this.template(answer));
      $('.answer-num').text(parseInt($('.answer-num').text()) + 1);
    },

    followQuestion: function () {
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/questions/' + this.question_id + '/follow',
        data: {
          _csrf: this.csrfToken
        },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          $('.follow-btn').removeClass('follow-btn follow-question')
            .addClass('unfollow-btn unfollow-question')
            .text('Unfollow Question');
        }
      });
    },

    unfollowQuestion: function () {
      spinner.start();
      $.ajax({
        type: 'POST',
        url: '/questions/' + this.question_id + '/unfollow',
        data: {
          _csrf: this.csrfToken
        },
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          $('.unfollow-btn').removeClass('unfollow-btn unfollow-question')
            .addClass('follow-btn follow-question')
            .text('Follow Question');
        }
      });
    },

    searchTopic: function () {
      if (this.timer) { clearTimeout(this.timer); }
      this.timer = setTimeout(this.searchTopicCallback(this), 100);
    },

    clearSearchResults: function () {
      this.$searchResults.addClass('hidden').find('ul').empty();
    },

    searchTopicCallback : function (self) {
      var that = self,
        term = that.$searchInput.val();

      if (!term.trim()) {
        that.clearSearchResults();
        return;
      }

      spinner.start();

      $.ajax({
        type  : 'GET',
        url   : '/topics/search?name=' + term,
        error : function (jqXHR, textStatus, errorThrow) {
          spinner.stop();
          if (jqXHR.responseJSON.msg === 'login required') {
            window.location.href = '/login';
          }
        },
        success : function (topics, textStatus, jqXHR) {
          that.clearSearchResults();
          spinner.stop();
          if (topics.length !== 0) {
            that.$searchResults.find('ul').append(_.template(searchTemplate)({
              topics: topics
            }));
            that.$searchResults.removeClass('hidden');
          }
        }
      });
    },

    addTopic: function (event) {
      var topic_id = $(event.currentTarget).data('topic-id'),
        topic_ids = this.question.get('topic_ids'),
        index = topic_ids.indexOf(topic_id),
        that = this;
      if (index === -1) {
        topic_ids.push(topic_id);
        this.question.set({
          update_type: 'add topic',
          topic_ids: topic_ids,
          added_topic_id: topic_id
        });
        spinner.start();
        this.question.save({}, {
          error: function (model, xhr, options) {
            spinner.stop();
            if (xhr.responseJSON.msg === 'login required') {
              window.location.href = '/login'
            }
          },
          success: function (data, textStatus, jqXHR) {
            spinner.stop();
            socket.emit('socketEditQuestionTopics', data);
          }
        });
      }
    },

    removeTopic: function (event) {
      var topic_id = $(event.target).data('topic-id'),
        topic_ids = this.question.get('topic_ids'),
        index = topic_ids.indexOf(topic_id),
        that = this;

      if (index !== -1) {
        if (topic_ids.length === 1) {
          return;
        }

        topic_ids.splice(index, 1);
        this.question.set({
          update_type: 'remove topic',
          topic_ids: topic_ids,
          removed_topic_id: topic_id
        });

        spinner.start();
        this.question.save({}, {
          error: function (model, xhr, options) {
            spinner.stop();
            if (xhr.responseJSON.msg === 'login required') {
              window.location.href = '/login';
            }
          },
          success: function (data, textStatus, jqXHR) {
            spinner.stop();
            socket.emit('socketEditQuestionTopics', data);
          }
        });
      }
    },

    reRenderTopics: function (self) {
      var that = self;
      return function (data) {
        that.$topicList.empty();
        that.$topicList.html(_.template(topicTpl)({topic_ids: data.topic_ids}));
        Backbone.history.loadUrl();
      };
    },

    reRenderTitle: function (self) {
      var that = self;
      return function (data) {
        if (Backbone.history.fragment === 'edit-title') {
          that.$bannerMsg.append(bannerMsgTpl);
          return;
        }
        that.$titleHeader.html(that.question.get('title'));
      };
    },

    saveEditingTitle: function () {
      var that = this;
      if (this.question.get('title') !== this.$titleHeader.text()) {

        spinner.start();
        this.question.save({
          'title': this.$titleHeader.text(),
          'update_type': 'update title'
        }, {
          error: function (model, xhr, options) {
            spinner.stop();
            if (xhr.responseJSON.msg === 'login required') {
              window.location.href = '/login';
            }
          },
          success: function (data, textStatus, jqXHR) {
            spinner.stop();
            socket.emit('socketEditQuestionTitle', data);
            that.trigger('saveEditingTitle');
          }
        });
      }
    },

    upvoteAnswer: function (e) {
      var $currentTarget = $(e.currentTarget),
        $opposite = $currentTarget.parent().find('.downvote'),
        answerId = $currentTarget.data('answer-id'),
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
          if($currentTarget.hasClass('voted')) {
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
        answerId = $currentTarget.data('answer-id'),
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
          if($currentTarget.hasClass('voted')) {
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
      var $voteText = that.$('.upvote-with-number[data-answer-id="' + options.answerId + '"]').parent(),
        $number = $voteText.find('.number'), len;
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

  return new View();
});
