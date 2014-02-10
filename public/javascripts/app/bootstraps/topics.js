require.config({
  baseUrl: '/javascripts/app/',
  shim: {
    underscore: { exports: '_' },
    backbone  : {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    bootstrap : {
      deps    : ['jquery'],
      exports : 'bootstrap'
    }
  },
  paths: {
    jquery    : '../libs/jquery/jquery-2.0.3.min',
    underscore: '../libs/underscore/underscore-1.5.2.min',
    backbone  : '../libs/backbone/backbone-1.1.0.min',
    bootstrap : '../vendor/bootstrap.min',
    spinner   : '../libs/spinner',
    text      : '../libs/require/text'
  }
});

require([
  'backbone',
  'routers/topics', 'views/topics/app',
  'bootstrap'
], function (Backbone, topicsRouter, appView) {
  Backbone.history.start();
});
