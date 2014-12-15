"use strict";

var Immutable = require('immutable');

var createStore = require('fluxible-app/utils/createStore');

var edgeNumber = 0;

var GraphStore = createStore({
  storeName: 'GraphStore',
  handlers: {
    'MOVE_NODE': function(payload) {
      this.graph = this.graph.mergeIn(['nodes', payload.id], {
        x: payload.newX,
        y: payload.newY
      });
      this.emitChange();
    },
    'GRAPH_LOADED': function(payload) {
      this.graph = payload.graph;
      this.emitChange();
    }
  },
  initialize(dispatcher) {
    /* Temporary default graph. */
    this.graph = Immutable.fromJS({
      nodes: {}, 
      edges: {}
    });
  },
  getState() {
    return { graph: this.graph };
  }
});

module.exports = GraphStore;
