define([ 'backbone' ], function (Backbone) {
  var Model = Backbone.Model.extend({
    url: '/questions',
    idAttribute: '_id'
  });

  return Model;
});
