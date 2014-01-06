define([
  'underscore', 'backbone', 'models/question'
], function (_, Backbone, Question) {
  var QuestionsCollection = Backbone.Collection.extend({
    model : Question,
    url   : '/questions/list'
  });

  return QuestionsCollection;
})
