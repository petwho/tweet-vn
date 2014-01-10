define([ 'backbone' ], function (Backbone) {
  var Model = Backbone.Model.extend({
    idAttribute: '_id',

    url: function () {
      return '/topics/' + this.get('_id') + '/follow';
    }
  });

  return Model;
});
