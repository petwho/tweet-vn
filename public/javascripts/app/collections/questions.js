define([ 'backbone', 'models/question'], function (Backbone, Question) {
  var _is_open = true;
  var Collection = Backbone.Collection.extend({
    model : Question,

    setOpen : function (bool) {
      this._is_open = bool;
    },

    url : function () {
      if (this._is_open === true) {
        return this.scrollCount ? '/open-questions/list?scrollcount=' + this.scrollCount : '/open-questions/list';
      }
    }
  });

  return new Collection();
});
