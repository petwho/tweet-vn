({
  baseUrl: '../../app',
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
    requireLib: '../libs/require/require-2.1.9.min',
    jquery    : '../libs/jquery/jquery-2.0.3.min',
    underscore: '../libs/underscore/underscore-1.5.2.min',
    backbone  : '../libs/backbone/backbone-1.1.0.min',
    socket    : 'empty:',
    bootstrap : '../vendor/bootstrap.min',
    tinymce   : 'empty:',
    spinner   : '../libs/spinner',
    text      : '../libs/require/text'
  },
  include: 'requireLib',
  preserveLicenseComments: false,
  name: 'bootstraps/question',
  out: '../question.js'
})