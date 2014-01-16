define([
  'share/socket', 'jquery', 'backbone', 'spinner',
  'models/question',
  'collections/topics',
  'text!templates/add_question/search_results.html',
  'text!templates/add_question/suggest_topic.html',
  'text!templates/add_question/add_topic.html'
], function (socket, $, Backbone, spinner, Question, Topics, searchTemplate, suggestTemplate, addTemplate) {
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
      this.$suggestedTopics = $('.suggested-topics');
      this.$addedTopics     = $('.added-topics');
      this.$searchResults   = $('#question-modal .search-results');
      this.topics           = new Topics();

      this.$cancel  = $('#question-modal .cancel');
      this.$prev    = $('#question-modal .prev');
      this.$prev    = $('#question-modal .prev');
      this.$next    = $('#question-modal .next');
      this.$submit  = $('#question-modal .submit');
      this.$form    = $('#question-modal form');
      this.timer    = null;
      // this.topics   = [];

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

      this.beginSuggest();
    },

    beginSuggest : function () {
      var print_topic,
        that = this,

      print_results = function (self) {
        var i, j, word, matched_list,
          html          = '',
          stat_list     = {},
          topics_length = self.topics.length;

        for (i = 0; i < topics_length; i++) {
          for (j = 0; j < self.topics.at(i).get('related_words').length; j++) {
            word = self.topics.at(i).get('related_words')[j];
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
        self.$suggestedTopics.html(_.template(suggestTemplate)({
          topics    : self.topics.toJSON(),
          stat_list : stat_list
        }));

        spinner.stop();
        self.setupView();
        self.$prev.show();
        self.$submit.show();
        self.$topicBox.show();
        if (self.$searchResults.find('ul > li').length === 0) {
          self.$searchResults.hide();
        }
        self.$searchInput.focus();
      };

      spinner.start();

      if (this.topics.length) {
        return print_results(this);
      } else {
        this.topics.fetch({
          error: function () {
            spinner.stop();
          },
          success: function () {
            print_results(that);
          }
        });
      }
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
            that.$searchResults.find('ul').append(_.template(searchTemplate)({
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

      this.$addedTopics.append(_.template(addTemplate)(topic));
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
          that.$searchResults.find('ul').empty();
          that.$suggestedTopics.empty();
          that.$addedTopics.empty();
          that.$modal.modal('hide');
          socket.emit('soketAddedQuestion', question);
        },
        wait: true
      });
    }
  });

  return AddQuestion;
});
