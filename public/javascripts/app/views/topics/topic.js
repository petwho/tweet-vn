define([
  'backbone', 'spinner',
  'text!templates/topics/topic.html'
], function (Backbone, spinner, topicTemplate) {
  var TopicView = Backbone.View.extend({

    events: {
      'click': 'Updatefollow'
    },

    template: _.template(topicTemplate),

    initialize: function () {
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
    },

    Updatefollow: function (e) {
      var that = this;

      spinner.start();

      this.model.save({_csrf: this.csrfToken}, {
        wait: true,
        error: function () {
          spinner.stop();
        },
        success: function () {
          that.render();
          spinner.stop();
        }
      });
    },

    afterRender: function () {
      this.isFollow = this.$('button').data('follow');
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      this.afterRender();
      return this;
    }
  });

  return TopicView;
});
