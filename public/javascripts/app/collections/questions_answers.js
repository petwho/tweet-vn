define([ 'backbone', 'models/question_answer'], function (Backbone, QuestionAnswer) {
  var Collection = Backbone.Collection.extend({
    model : QuestionAnswer,
    url   : function () {
      return this.scrollCount ? '/questions-answers/list?scrollcount=' + this.scrollCount : '/questions-answers/list';
    }
  });

  return new Collection();
});
