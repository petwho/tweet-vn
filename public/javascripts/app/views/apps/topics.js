define([
  'backbone', 'spinner', 'collections/topics', 'views/topic'
], function (Backbone, spinner, Topics, TopicView) {
  var AppView = Backbone.View.extend({
    el: '#topic-list',

    initialize: function () {
      this.topics   = new Topics;
      this.counter  = 0;
      this.listenTo(this.topics, 'add', this.addPrimaryTopic);
      this.topics.fetch({
        success: function () {
          spinner.stop();
        }
      });
    },

    addPrimaryTopic: function (topic) {
      if (topic.get('is_primary') === true) {
        var topicView = new TopicView({ model: topic });
        this.$('.col-sm-4:nth-child(' + (this.counter % 3 + 1) + ')').append(topicView.render().el);
        this.counter++;
      }
    }
  });

  return AppView;
});
