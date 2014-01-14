define([ 'backbone', 'models/question_answer'], function (Backbone, QuestionAnswer) {
  var Collection = Backbone.Collection.extend({
    model : QuestionAnswer,
    url   : '/questions-answers/list'
  });

  return new Collection;
})
