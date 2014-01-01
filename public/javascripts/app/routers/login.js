define(['backbone'], function (Backbone) {
  var LoginRouter = Backbone.Router.extend({
    routes: {
      ''                : 'index',
      // 'index'           : 'index',
      'signup'          : 'signup',
      'forgot-password' : 'forgotPassword'
    },
    hideAll: function () {
      $('.login').addClass('hidden');
      $('.signup').addClass('hidden');
      $('.signup-form').addClass('hidden');
      $('.forgot-password-form').addClass('hidden');
    },
    index: function () {
      this.hideAll();
      $('.login').removeClass('hidden');
      $('.signup').removeClass('hidden');
    },

    signup: function () {
      this.hideAll();
      $('.signup-form').removeClass('hidden');
    },

    forgotPassword: function () {
      this.hideAll();
      $('.forgot-password-form').removeClass('hidden');
    }
  });

  return LoginRouter;
});
