define([
  'sockets/connect_to_room', 'backbone', 'spinner', '../../libs/move_caret_to_end',
  'views/apps/question', 'models/question'
], function (socket, Backbone, spinner, moveCaret, appView, Question) {
  var Router = Backbone.Router.extend({
    routes: {
      'edit-topics': 'editTopic',
      'delete-topics': 'editTopic',
      'edit-title' : 'editTitle',
      'add-details': 'addDetails',
      'cancel-edit-title': 'cancelEditTitle',
      'refresh': 'refresh',
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
      this.$titleHeader = $('#question h1.title');
      this.$titleHeader.bind('paste', this.pasteText);
      this.setupVars();

      this.listenTo(appView, 'saveEditingTitle', this.saveEditingTitle);
    },

    setupVars: function () {
      this.$editTopicsLn = $('#question .edit-topics-link');
      this.$topicItems = $('#question .topic-item');
      this.$editingTopicItems = $('#question .editing-topic-item');

      this.$editTitleLn = $('#question .edit-title-link');
    },

    setupView: function () {
      this.setupVars();
      // show links
      this.$editTopicsLn.show();
      this.$editTitleLn.show();
      // show question's components
      this.$topicItems.show();
      this.$editingTopicItems.addClass('hidden');
      this.$searchBox.addClass('hidden');
      this.$editTitleActions.addClass('hidden');
      this.$titleHeader.attr('contenteditable', false);
    },

    index: function () {
      this.setupView();
    },

    cancelEditTitle: function () {
      this.$titleHeader.html(appView.question.get('title'));
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
    },

    saveEditingTitle: function () {
      this.$editTitleActions.addClass('hidden');
      this.$titleHeader.attr('contenteditable', false);
      this.navigate('', {trigger: true});
    },

    refresh: function () {
      $('.banner-msg').empty();
      this.$titleHeader.html(appView.question.get('title'));
      this.navigate('', {trigger: true});
    },

    pasteText: function () { // catch the paste-event in the DIV
      // get content before paste
      var before = document.getElementById('title-editor').innerHTML;
      setTimeout(function () {
        var after, pos1, pos2, i, pasted, replace, replaced;
        // get content after paste by a 100ms delay
        after = document.getElementById('title-editor').innerHTML;
        // find the start and end position where the two differ
        pos1 = -1;
        pos2 = -1;
        for (i = 0; i < after.length; i++) {
          if (pos1 === -1 && before.substr(i, 1) !== after.substr(i, 1)) {
            pos1 = i;
          }
          if (pos2 === -1 && before.substr(before.length - i - 1, 1) !== after.substr(after.length - i - 1, 1)) {
            pos2 = i;
          }
        }
        // the difference = pasted string with HTML:
        pasted = after.substr(pos1, after.length - pos2 - pos1);
        // strip the tags:
        replace = pasted.replace(/<[^>]+>/g, '');
        // build clean content:
        replaced = after.substr(0, pos1) + replace + after.substr(pos1 + pasted.length);
        // replace the HTML mess with the plain content
        document.getElementById('title-editor').innerHTML = replaced;
      }, 100);
    }
  });

  return Router;
});
