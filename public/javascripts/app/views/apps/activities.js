define([
  'sockets/connect_to_room', 'jquery', 'backbone', 'spinner',
  'collections/activities',
  'text!templates/activities/activity.html'
], function (socket, $, Backbone, spinner, activities, actTpl) {
  var View = Backbone.View.extend({
    el: '#activity-feed',

    initialize: function () {
      activities.fetch({
        error: function (argument) {
          $('.spinner-large').empty().html('Error loading page.');
        },
        success: function () {
          $('.spinner-large').remove();
        }
      });
      this.listenTo(activities, 'add', this.addActifity);
    },

    template: _.template(actTpl),

    addActifity: function (activity) {
      this.$el.append(this.template(activity.toJSON()));
    }
  });
  return View;
});
