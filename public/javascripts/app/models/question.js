define([ 'backbone' ], function (Backbone) {
  var Model = Backbone.Model.extend({
    url: '/questions'
  });

  return Model;
});
