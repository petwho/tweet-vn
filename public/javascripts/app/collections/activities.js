define(['backbone', 'models/activity'], function (Backbone, Activity) {
  var Collection = Backbone.Collection.extend({
    model: Activity,
    url: '/activities/list'
  });
  return new Collection();
});
