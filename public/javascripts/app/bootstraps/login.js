require.config({
  baseUrl: 'javascripts/app/',
  shim: {
    underscore: { exports: '_' },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  },
  paths: {
    jquery: '../libs/jquery/jquery-2.0.3.min',
    underscore: '../libs/underscore/underscore-1.5.2.min',
    backbone: '../libs/backbone/backbone-1.1.0.min',
    text: '../libs/require/text'
  }
});

require([
  'backbone', 'routers/login', 'views/login'
], function (Backbone, LoginRouter, LoginView) {
  new LoginView();
  new LoginRouter();
  Backbone.history.start();
});