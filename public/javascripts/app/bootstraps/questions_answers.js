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
    },
    tinymce   : {
      exports : 'tinymce'
    }
  },
  paths: {
    jquery    : '../libs/jquery/jquery-2.0.3.min',
    underscore: '../libs/underscore/underscore-1.5.2.min',
    backbone  : '../libs/backbone/backbone-1.1.0.min',
    socket    : '/socket.io/socket.io.js',
    bootstrap : '../vendor/bootstrap.min',
    tinymce   : '../vendor/tinymce/tinymce.min',
    spinner   : '../libs/spinner',
    text      : '../libs/require/text'
  }
});

require(['jquery'], function ($) {
  $('.sub-menu li.qas').addClass('active');
});

require([
  'bootstrap', 'backbone',
  'share/add_question', 'share/search',
  'views/questions_answers/app'
], function (bootstrap, Backbone, addQuestionView, search, AppView) {
  new AppView();
});
