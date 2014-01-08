define([ 'backbone', 'models/question'], function (Backbone, Question) {
  var Questions = Backbone.Collection.extend({
    model : Question,
    url   : '/questions/list'
  });

  return Questions;
})
