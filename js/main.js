require.config({
  paths: {
    'jquery': '/bower_components/jquery/dist/jquery',
    'underscore': '/bower_components/underscore/underscore',
    'backbone': '/bower_components/backbone/backbone',
    'mustache': '/bower_components/mustache.js/mustache',
    'text': '/bower_components/text/text'
  },
  shim: {
    'jquery': {
      exports: '$'
    },
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'mustache': {
      exports: 'Mustache'
    }
  }
});

require(['app'], function (App) {
  App.initialize();
});
