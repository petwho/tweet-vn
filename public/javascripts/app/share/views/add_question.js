define([
  'jquery', 'backbone', 'spinner',
  'models/question', 'collections/questions',
  'text!templates/add_question/search_topic.html',
  'text!templates/add_question/suggest_topic.html',
  'text!templates/add_question/new_topic.html'
], function ($, Backbone, spinner, Question, questions, searchTemplate, suggestTemplate, newTemplate) {
  var AddQuestion = Backbone.View.extend({
    el: 'body',

    events: {
      'click #add-question'           : 'showDialog',
      'click #question-modal .next'   : 'next',
      'click #question-modal .prev'   : 'prev',
      'click #question-modal .submit' : 'submit',
      'keyup #question-modal .search-input' : 'searchTopic',
      'click #question-modal .search-results > ul > li' : 'addTopic'
    },

    initialize: function () {
      this.csrfToken        = $('meta[name="csrf-token"]').attr('content');
      this.$modal           = $('#question-modal');
      this.$titleBox        = $('#question-modal .title-box');
      this.$questionTitle   = $('#question-modal .q-title');
      this.$notice          = $('#question-modal .notice');
      this.$topicBox        = $('#question-modal .topic-box');
      this.$searchInput     = $('#question-modal .search-input');
      this.$topicList       = $('.topic-list');
      this.$searchResults   = $('#question-modal .search-results');

      this.$cancel  = $('#question-modal .cancel');
      this.$prev    = $('#question-modal .prev');
      this.$prev    = $('#question-modal .prev');
      this.$next    = $('#question-modal .next');
      this.$submit  = $('#question-modal .submit');
      this.$form    = $('#question-modal form');
      this.timer    = null;
      this.topics   = [];

      this.$form.on('submit', function (e) {
        e.preventDefault();
      });
    },

    setupView: function () {
      this.$titleBox.hide();
      this.$topicBox.hide();
      this.$notice.hide();

      this.$cancel.hide();
      this.$prev.hide();
      this.$next.hide();
      this.$submit.hide();
    },

    showDialog: function () {
      this.setupView();

      this.$cancel.show();
      this.$next.show();
      this.$titleBox.show();

      this.$modal.modal();
      this.$questionTitle.focus();
      $('#question-modal .modal-dialog').css({
        marginTop: ($(window).height() - $('#question-modal .modal-dialog').height()) / 2 + 'px'
      });
    },

    next : function () {
      var that = this;

      if (!this.$questionTitle.val() || this.$questionTitle.val().trim().length < 10) {
        this.$notice.html('<strong>This question needs more details.</strong>');
        this.$notice.show();
        return;
      }

      this.suggestTopics({
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          that.setupView();
          that.$prev.show();
          that.$submit.show();
          that.$topicBox.show();
          if (that.$searchResults.find('ul > li').length === 0) {
            that.$searchResults.hide();
          }
          that.$searchInput.focus();
        }
      });
    },

    suggestTopics : function (options) {
      var that = this;
      this.$topicList.find('.suggest-topic').remove();
      spinner.start();
      $.ajax({
        type  : 'GET',
        url   : '/topics/list',
        error : function (jqXHR, textStatus, errorThrow) {
          if (options.error !== undefined) { options.error(); }
        },
        success : function (topics, textStatus, jqXHR) {
          var i, j, word, matched_list,
            html          = '',
            stat_list     = {},
            topics_length = topics.length;

          that.topics = topics;

          for (i = 0; i < topics_length; i++) {
            for (j = 0; j < topics[i].related_words.length; j++) {
              word = topics[i].related_words[j];
              if (stat_list[word] === undefined) {
                stat_list[word] = 0;
              }
              matched_list = that.$questionTitle.val().match(new RegExp(word, 'gi'));
              if (matched_list) {
                stat_list[word] += matched_list.length;
              }
            }
          }
          // render suggest topic list
          that.$topicList.append(_.template($(suggestTemplate).html())({
            topics : topics,
            stat_list: stat_list
          }));

          if (options.success !== undefined) { options.success(); }
        }
      });
    },

    prev : function () {
      this.setupView();
      this.$cancel.show();
      this.$next.show();
      this.$titleBox.show();
      this.$questionTitle.focus();
    },

    searchTopic : function () {
      if (this.timer) { clearTimeout(this.timer); }

      this.timer = setTimeout(this.searchTopicCallback(this), 100);
    },

    clearSearchResults : function () {
      this.$searchResults.hide().find('ul').empty();
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
        },
        success : function (topics, textStatus, jqXHR) {
          that.clearSearchResults();
          spinner.stop();
          if (topics.length !== 0) {
            that.$searchResults.find('ul').append(_.template($(searchTemplate).html())({
              topics: topics
            }));
            that.$searchResults.show();
          }
        }
      });
    },

    addTopic: function (e) {
      var topic = {},
        $target = $(e.currentTarget);

      topic._id             = $target.data('topic-id');
      topic.name            = $target.find('.name').data('name');
      topic.follower_count  = $target.find('.followers').data('followers');

      this.$topicList.append(_.template($(newTemplate).html())(topic));
    },

    submit: function (e) {
      var  question,
        that = this;
      spinner.start();

      question = new Question();

      question.save({
        _csrf     : this.csrfToken,
        title     : this.$form.find('textarea[name="title"]').val(),
        topic_ids : this.$form.find('input:checkbox:checked[name="topics"]').map(function () { return $(this).val(); }).get()
      }, {
        error: function () {
          spinner.stop();
        },
        success: function () {
          spinner.stop();
          that.$questionTitle.val('');
          that.$searchInput.val('');
          that.$searchResults.empty();
          that.$topicList.empty();
          that.$modal.modal('hide');
          questions.add(question);
        },
        wait: true
      });
    }
  });

  return AddQuestion;
});
