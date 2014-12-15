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
    }
  },
  initialize(dispatcher) {
    /* Temporary default graph. */
    this.graph = Immutable.fromJS({
      nodes: {
        'node-1' : { title: 'Node #1', x: 100, y: 100 },
        'node-2' : { title: 'Node #2', x: 50, y: 300 }
      }, 
      edges: {
        'edge-1': { source: 'node-1', target: 'node-2' }
      }
    });
  },
  getState() {
    return { graph: this.graph };
  }
});

module.exports = GraphStore;
