define(['backbone'], function (Backbone) {
  var LoginRouter = Backbone.Router.extend({
    routes: {
      'signup'          : 'signup',
      'forgot-password' : 'forgotPassword',
      '*other'          : 'index'
    },

    setup: function () {
      $('.login').addClass('hidden');
      $('.signup').addClass('hidden');
      $('.signup-form').addClass('hidden');
      $('.forgot-password-form').addClass('hidden');
      $('.msg-wrapper').empty();
      $('.spinner-large').remove();
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
