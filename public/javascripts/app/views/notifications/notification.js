define([
  'backbone',
  'text!templates/notifications/notification.html'
], function (Backbone, notificationTpl) {
  var View = Backbone.View.extend({
    template: _.template(notificationTpl),

    className: 'notification row',

    initialize: function () {
      this.render();
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      if (!this.model.get('is_read')) {
        this.$el.addClass('unread');
      }
      return this;
    }
  });
  return View;
});
