"use strict";

var React = require('react')
  , FluxibleApp = require('fluxible');

var app = new FluxibleApp({
  appComponent: React.createFactory(require('./components/App.jsx'))
});

app.registerStore(require('./stores/GraphStore'));

var context = app.createContext();

var loadPageAction = require('./actions/loadPageAction')
  , loadConfigAction = require('./actions/loadConfigAction');

context.executeAction(loadPageAction, {}, function(err) {
  if (err) throw err;

  context.getComponentContext().executeAction(loadConfigAction, {
    proto: 'data/caffe.proto',
    //config: 'data/mnist_autoencoder.prototxt'
    config: 'data/bvlc_reference_caffenet.prototxt'
  });

  var element = context.createElement({});
  React.render(element, document.body);
});
