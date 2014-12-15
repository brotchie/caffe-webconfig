"use strict";

var _ = require('lodash');

var buildGraph = function(netParam) {
  var PHASES = netParam.$type.builder.lookup('caffe.Phase').object;

  var nodes = _(netParam.layers)
    .filter(function(layer) {
      return layer.include.length === 0 || layer.include[0].phase == PHASES.TRAIN;
    })
    .map(function(layer, index) {
      return ['node-' + index, layer];
    })
    .object()
    .value();

  var edges = [];
  var stacks = {};

  var addEdge = function(source, target) {
    edges.push({
      id: 'edge-' + edges.length,
      source: source,
      target: target
    });
  };

  _(nodes).forEach(function(layer, nodeid) {
    layer.top.forEach(function(top) {
      var inplace = _.contains(layer.bottom, top);

      if (inplace) {
        if (stacks[top] === undefined) {
          throw Error('In place layer "' + layer.name + '" without existing bottom layer');
        }
        addEdge(stacks[top][0], nodeid);
        stacks[top].unshift(nodeid);
      } else {
        if (stacks[top] !== undefined) {
          throw Error('Non in place layer "' + layer.name + '" trying to use an already used top layer');
        }
        stacks[top] = [nodeid];
      }
    });

    layer.bottom.forEach(function(bottom) {
      var inplace = _.contains(layer.top, bottom);

      if (inplace)
        return;

      if (!stacks[bottom])
          throw Error('Invalid bottom "' + bottom + '" in "' + layer.name + '"');
      addEdge(stacks[bottom][0], nodeid);
    });
  });

  return {
    nodes: nodes,
    edges: edges
  };
};

exports.buildGraph = buildGraph;
