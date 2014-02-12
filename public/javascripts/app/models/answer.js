define([
  'underscore',
  'backbone'
], function (_, Backbone) {
  var Answer = Backbone.Model.extend({
    url: '/answers',
    idAttribute: '_id'
  });

  return Answer;
})
