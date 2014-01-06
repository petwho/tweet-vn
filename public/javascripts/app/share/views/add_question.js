define([
  'jquery', 'backbone', 'spinner',
  'text!templates/add_question/search_topic.html',
  'text!templates/add_question/suggest_topic.html'
], function ($, Backbone, spinner, searchTopictemplate, suggestTopictemplate) {
  var AddQuestion = Backbone.View.extend({
    el: 'body',

    events: {
      'click #add-question': 'addQuestion',
      'click #question-modal .next' : 'next',
      'click #question-modal .prev' : 'prev',
      'keyup #question-modal .search-input' : 'searchTopic',
      'click #question-modal .search-results > ul > li' : 'addTopic'
    },

    initialize: function () {
      this.$modal           = $('#question-modal');
      this.$titleBox        = $('#question-modal .title-box');
      this.$questionTitle   = $('#question-modal .q-title');
      this.$notice          = $('#question-modal .notice');
      this.$topicBox        = $('#question-modal .topic-box');
      this.$searchInput     = $('#question-modal .search-input');
      this.$suggestTopics   = $('.suggest-topics');
      this.$searchResults   = $('#question-modal .search-results');

      this.$cancel  = $('#question-modal .cancel');
      this.$prev    = $('#question-modal .prev');
      this.$prev    = $('#question-modal .prev');
      this.$next    = $('#question-modal .next');
      this.$submit  = $('#question-modal .submit');
      this.timer    = null;
      this.topics   = [];

      $('#question-modal form').on('submit', function (e) {
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

    addQuestion: function () {
      this.setupView();

      this.$cancel.show();
      this.$next.show();
      this.$titleBox.show();

      this.$modal.modal();
      this.$questionTitle.focus();
      $('#question-modal .modal-dialog').css({ marginTop: ($(window).height() - $('#question-modal .modal-dialog').height()) / 2 + 'px'});
    },

    next : function () {
      if (!this.$questionTitle.val() || this.$questionTitle.val().length < 10) {
        this.$notice.html('<strong>This question needs more details.</strong>');
        this.$notice.show();
        return;
      }
      this.suggestTopicsFunc();
      spinner.start();
      this.setupView();
      this.$prev.show();
      this.$submit.show();
      this.$topicBox.show();
      if (this.$searchResults.find('ul > li').length === 0) {
        this.$searchResults.hide();
      }
      this.$searchInput.focus();
    },

    suggestTopicsFunc : function () {
      var self = this;
      $.ajax({
        type  : 'GET',
        url   : '/topics/list',
        error : function (jqXHR, textStatus, errorThrow) {
          spinner.stop();
        },
        success : function (topics, textStatus, jqXHR) {
          var i, j, word, matched_list,
            html          = '',
            stat_list     = {},
            topics_length = topics.length;

          self.topics = topics;
          self.$suggestTopics.empty();

          for (i = 0; i < topics_length; i++) {
            for (j = 0; j < topics[i].related_words.length; j++) {
              word = topics[i].related_words[j];
              if (stat_list[word] === undefined) {
                stat_list[word] = 0;
              }
              matched_list = self.$questionTitle.val().match(new RegExp(word, 'gi'));
              if (matched_list) {
                stat_list[word] += matched_list.length;
              }
            }
          }
          // render suggest topic list
          self.$suggestTopics.append(_.template($(suggestTopictemplate).html())({
            topics : topics, stat_list: stat_list
          }));
          spinner.stop();
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

    searchTopicCallback : function (that) {
      var self = that,
        term = self.$searchInput.val();

      if (!term.trim()) {
        self.clearSearchResults();
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
          self.clearSearchResults();
          spinner.stop();
          if (topics.length !== 0) {
            self.$searchResults.find('ul').append(_.template($(searchTopictemplate).html())({
              topics: topics
            }));
            self.$searchResults.show();
          }
        }
      });
    },

    addTopic: function (e) {
      $(e.target);
    }
  });

  return AddQuestion;
});
