define([ 'backbone', 'models/question'], function (Backbone, Question) {
  var QuestionsCollection = Backbone.Collection.extend({
    model : Question,
    url   : '/questions/list'
  });

  return QuestionsCollection;
})
