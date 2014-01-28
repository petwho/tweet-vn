define([
  'jquery', 'backbone',
  'collections/notifications',
  'views/notifications/notification',
  'text!templates/error.html'
], function ($, Backbone, notifications, NotificationView, errorTpl) {
  var View = Backbone.View.extend({
    el: '#notifications',

    initialize: function () {
      notifications.fetch({
        error: function () {
          $('.spinner-large').empty().html(errorTpl);
        },
        success: function () {
          $('.spinner-large').empty();
        }
      });

      this.listenTo(notifications, 'add', this.addNotification);
    },

    addNotification: function (notification) {
      var ntfView;
      if (notification.get('type') !== 20) {
        ntfView = new NotificationView({model: notification});
        this.$el.append(ntfView.el);
      }
    }
  });

  return new View();
});
