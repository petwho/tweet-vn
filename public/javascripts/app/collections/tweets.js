define([ 'backbone', 'models/tweet' ], function (Backbone, Tweet) {
  var Tweets = Backbone.Collection.extend({
    model : Tweet,
    url   : '/tweets/list'
  });

  return Tweets;
});
