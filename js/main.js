"use strict";

var React = require('react')
  , FluxibleApp = require('fluxible-app');

var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/App.jsx'))
});

app.registerStore(require('./stores/GraphStore'));

var context = app.createContext();

var loadPageAction = require('./actions/loadPageAction');
context.executeAction(loadPageAction, {}, function(err) {
  if (err) throw err;

  var element = context.createElement({});
  React.render(element, document.body);
});
