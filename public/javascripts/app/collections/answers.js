define([ 'backbone', 'models/answer' ], function (Backbone, Answer) {
  var Answers = Backbone.Collection.extend({
    model : Answer,
    url   : '/answers/list'
  });

  return Answers;
});
