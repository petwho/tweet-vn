define([
  'underscore',
  'backbone'
], function (_, Backbone) {
  var Tweet = Backbone.Model.extend({
    url: '/tweets',
    idAttribute: '_id'
  });

  return Tweet;
})
