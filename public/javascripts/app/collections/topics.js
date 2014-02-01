define([ 'backbone', 'models/topic'], function (Backbone, Topic) {
  var Topics = Backbone.Collection.extend({
    model : Topic,

    url   : '/topics/list',

    followingPrimaryCount: function () {
      return this.filter(function (topic) {
        if (topic.get('is_primary') === true) {
          return topic.get('is_following');
        }
        return false;
      });
    }
  });

  return Topics;
});
