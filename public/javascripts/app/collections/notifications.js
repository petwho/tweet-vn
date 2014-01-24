define(['backbone', 'models/notification'], function (Backbone, Notification) {
  var Collection = Backbone.Collection.extend({
    url: '/notifications/list',
    model: Notification
  });
  return new Collection();
});
