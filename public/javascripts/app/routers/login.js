define(['backbone'], function (Backbone) {
  var LoginRouter = Backbone.Router.extend({
    routes: {
      ''                : 'index',
      'signup'          : 'signup',
      'forgot-password' : 'forgotPassword'
    },

    setup: function () {
      $('.login').addClass('hidden');
      $('.signup').addClass('hidden');
      $('.signup-form').addClass('hidden');
      $('.forgot-password-form').addClass('hidden');
      $('.message .router-msg').empty();
    },

    index: function () {
      this.setup();
      $('.login').removeClass('hidden');
      $('.signup').removeClass('hidden');
    },

    signup: function () {
      this.setup();
      $('.signup-form').removeClass('hidden');
    },

    forgotPassword: function () {
      this.setup();
      $('.forgot-password-form').removeClass('hidden');
    }
  });

  return LoginRouter;
});
