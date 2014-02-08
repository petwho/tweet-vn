define([
  'backbone', 'spinner',
  'text!templates/topics/related_topic.html',
  'text!templates/topics/link_button.html'
], function (Backbone, spinner, topicTemplate, linkText) {
  var TopicView = Backbone.View.extend({

    className: 'topic row',

    template: _.template(topicTemplate),

    events: {
      'change .checkbox input[type="checkbox"]': 'toggleCheckbox'
    },

    initialize: function () {
      this.csrfToken = $('meta[name="csrf-token"]').attr('content');
    },

    toggleCheckbox: function (e) {
      var topic, that = this;
      topic = this.collection.findWhere({_id: $(e.currentTarget).val()});

      spinner.start();

      topic.save({_csrf: this.csrfToken}, {
        wait: true,
        error: function () {
          spinner.stop();
        },
        success: function () {
          $('input[value="' + $(e.currentTarget).val() + '"]').prop('checked', $(e.currentTarget).prop('checked'));
          spinner.stop();
        }
      });
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return TopicView;
});
