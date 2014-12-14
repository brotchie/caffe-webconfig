"use strict";

var React = require('react')
  , FluxibleApp = require('fluxible-app');

var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/App.jsx'))
});

app.plug(require('./plugins/jsplumb-plugin'));

var context;

/* Only trigger page load action once we're sure
 * jsPlumb is loaded and ready. */
window.jsPlumb.ready(function(jsPlumb) {
  context = app.createContext({
    jsPlumb: jsPlumb
  });
  var loadPageAction = require('./actions/loadPageAction');
  context.executeAction(loadPageAction, {}, renderApplication);
});

function renderApplication(err) {
  if (err) throw err;

  var element = context.createElement({});
  React.render(element, document.body);
};
