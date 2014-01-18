define(['backbone', 'models/question'], function (Backbone, Question) {
  var Router = Backbone.Router.extend({
    routes: {
      'edit-topics': 'editTopic',
      'delete-topics': 'editTopic',
      'edit-title' : 'editTitle',
      'add-details': 'addDetails',
      'done': 'done',
      'remove-topic/:id': 'removeTopic',
      '*other': 'index'
    },

    initialize: function () {
      var topic_ids = $('#question .topic-item a').map(function () {
        return $(this).data('id');
      }).get();

      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
      this.editTopicsBtn = $('#question .edit-topics-btn');
      this.topicItems = $('#question .topic-item');
      this.editingTopicItems = $('#question .editing-topic-item');
      this.searchBox = $('#question .search-box');

      this.question = new Question({
        _csrf: this.csrfToken,
        _id: $('#question').data('id'),
        topic_ids: topic_ids,
        update_type: 'topics'
      });
    },

    setupView: function () {
      this.editTopicsBtn.show();
      this.topicItems.show();
      this.editingTopicItems.addClass('hidden');
      this.searchBox.addClass('hidden');
    },

    index: function () {
      this.setupView();
    },

    editTopic: function () {
      this.editTopicsBtn.hide();
      this.topicItems.hide();
      this.editingTopicItems.removeClass('hidden');
      this.searchBox.removeClass('hidden');
    },

    done: function () {
      this.setupView();
    },

    removeTopic: function (id) {
      var topic_ids = this.question.get('topic_ids'),
        index = topic_ids.indexOf(id);
      if (index !== -1) {
        topic_ids.splice(index, 1);
        this.question.set({
          topic_ids: topic_ids,
          removed_topic_id: id
        });
      }

      this.question.save({}, {
        error: function () {

        },
        success: function () {

        }
      });
      // this.navigate('', {trigger: true});
    }
  });

  return Router;
});
