define([
  'backbone', 'spinner', 'collections/topics', 'views/topics/topic', 'views/topics/related_topics',
], function (Backbone, spinner, Topics, TopicView, RelatedTopicView) {
  var AppView = Backbone.View.extend({
    el: '#welcome-flow',

    events: {
      'click .headline .step-1.clickable': 'step1',
      'click .headline .step-2.clickable': 'step2',
      'click .headline .step-3.clickable': 'step3'
    },

    initialize: function () {
      var that = this;
      this.topics = new Topics();
      this.listenTo(this.topics, 'change:is_following', this.followingTopic);
      this.listenTo(this.topics, 'addPrimaryTopic', this.addPrimaryTopic);
      this.listenTo(this.topics, 'addRelatedTopics', this.addRelatedTopics);
    },

    step1: function () {
      this.trigger('go-to-step1');
    },

    step2: function () {
      this.trigger('go-to-step2');
    },

    step3: function () {
      this.trigger('go-to-step3');
    },

    addPrimaryTopic: function (topics) {
      var counter = 0,
        that = this;

      topics.each(function (topic) {
        if (topic.get('is_primary') === true) {
          var topicView = new TopicView({ model: topic });
          that.$('.col-xs-4:nth-child(' + (counter % 3 + 1) + ')').append(topicView.render().el);
          counter++;
        }
      });
    },

    addRelatedTopics: function (topics) {
      var counter = 0,
        that = this;

      topics.each(function (topic) {
        if (topic.get('is_following') && topic.get('is_primary')) {
          var relatedTopicView = new RelatedTopicView({ model: topic, collection: that.topics });
          that.$('.col-xs-6:nth-child(' + (counter % 2 + 1) + ')').append(relatedTopicView.render().el);
          counter++;
        }
      });
    },

    followingTopic: function () {
      this.trigger('updateFollowing');
    }
  });

  return new AppView();
});
