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
    socket    : '/socket.io/socket.io.js',
    bootstrap : '../vendor/bootstrap.min',
    spinner   : '../libs/spinner',
    text      : '../libs/require/text'
  }
});

require([
  'backbone',
  'views/notifications/app',
  'bootstrap', 'share/add_question', 'share/search', 'share/analytic'
], function (Backbone, appView) {
  $('.sub-menu li.notifications').addClass('active');
  $('.spinner-large').css({visibility: 'hidden'});
});
