define([
  'share/socket', 'backbone', 'spinner', '../../libs/move_caret_to_end',
  'models/question'
], function (socket, Backbone, spinner, moveCaret, Question) {
  var Router = Backbone.Router.extend({
    routes: {
      'edit-topics': 'editTopic',
      'delete-topics': 'editTopic',
      'edit-title' : 'editTitle',
      'add-details': 'addDetails',
      'cancel-edit-title': 'cancelEditTitle',
      '*other': 'index'
    },

    initialize: function () {
      var topic_ids, that = this;

      topic_ids = $('#question .topic-item a').map(function () {
        return $(this).data('id');
      }).get();

      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.$topicList = $('#question .topic-list');
      this.$searchBox = $('#question .search-box');
      this.$editTitleActions = $('#question .edit-title-actions');
      this.setupVars();

      this.question = new Question({
        _csrf: this.csrfToken,
        _id: $('#question').data('id'),
        topic_ids: topic_ids
      });
    },

    setupVars: function () {
      this.$editTopicsLn = $('#question .edit-topics-link');
      this.$topicItems = $('#question .topic-item');
      this.$editingTopicItems = $('#question .editing-topic-item');

      this.$editTitleLn = $('#question .edit-title-link');
      this.$titleHeader = $('#question .title-text h1');
    },

    setupView: function () {
      this.setupVars();
      this.$editTopicsLn.show();
      this.$topicItems.show();
      this.$editingTopicItems.addClass('hidden');
      this.$searchBox.addClass('hidden');
    },

    cancelEditTitle: function () {
      this.$editTitleLn.show();
      this.$editTitleActions.addClass('hidden');
      this.$titleHeader.attr('contenteditable', false);
    },

    index: function () {
      this.setupView();
    },

    editTopic: function () {
      this.setupView();
      this.$editTopicsLn.hide();
      this.$topicItems.hide();
      this.$editingTopicItems.removeClass('hidden');
      this.$searchBox.removeClass('hidden');
    },

    editTitle: function () {
      var that = this;
      this.$editTitleLn.hide();
      this.$titleHeader.attr('contentEditable', true);
      this.$editTitleActions.removeClass('hidden');

      this.$titleHeader.on('focus', function (event) {
        moveCaret.contenteditable(event.target);
        window.setTimeout(function () {
          moveCaret.contenteditable(event.target);
        }, 1);
      });

      this.$titleHeader.trigger('focus');
    }
  });

  return Router;
});
