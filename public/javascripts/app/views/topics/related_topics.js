define([
  'backbone', 'spinner',
  'views/topics/app',
  'text!templates/topics/related_topic.html',
  'text!templates/topics/link_button.html',
  'text!/stylesheets/topic.css'
], function (Backbone, spinner, appView, topicTemplate, linkText, topicCSS) {
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
      if (!$('head style[name="topic"]').length) {
        $('head').append("<style name='topic'>" + topicCSS + "</style>");
      }
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return TopicView;
});
