define(['backbone', 'views/settings/app'], function (Backbone, appView) {
  var Router = Backbone.Router.extend({
    routes: {
      'change-password': 'changePassword',
      '*other': 'index'
    },

    index: function (argument) {
      appView.trigger('setup');
    },

    changePassword: function () {
      appView.trigger('changePassword');
    }
  });
  return Router;
});
