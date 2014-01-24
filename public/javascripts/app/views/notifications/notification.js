define([
  'backbone',
  'text!templates/notifications/notification.html'
], function (Backbone, notificationTpl) {
  var View = Backbone.View.extend({
    template: _.template(notificationTpl),

    initialize: function () {
      this.render();
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  return View;
});
