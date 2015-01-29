"use strict";

var request = require('superagent')
  , async = require('async')
  , _ = require('lodash');

var ProtoBuf = require('protobufjs')
  , TextFormat = require('protobuf-textformat');

var buildGraph = require('../utils/graph').buildGraph;

var Immutable = require('immutable');

var fetchData = function(url) {
  return function(next) {
    request.get(url, function(err, res) {
      if (err) {
        next(err);
      } else {
        next(null, res.text);
      }
    });
  };
};

var layoutGraph = function(graph, callback) {
  var klayInputGraph = {
    id: 'root',
    properties: {
      direction: 'DOWN',
      spacing: 10,
      nodeLayering: 'INTERACTIVE'
    },
    children: _.map(graph.nodes, (node, id) => { return { id: id, width: 200, height: 100}}),
    edges: graph.edges
  };

  var autolayouter = klay.init({
      onSuccess(kgraph) {
        var finalGraph = {};
        console.log(kgraph);
        finalGraph.nodes = _(kgraph.children)
          .map(child => {
            return [child.id, Immutable.Map({ x: child.x, y: child.y, message: graph.nodes[child.id]})];
          })
          .object()
          .value();

        finalGraph.edges = _(kgraph.edges)
          .map(edge => {
            return [edge.id, { source: edge.source, target: edge.target }];
          })
          .object()
          .value();

        callback(null, Immutable.fromJS(finalGraph));
      },
      workerScript: '/node_modules/klay-js/klay-worker.js'
    });
  autolayouter.layout({graph: klayInputGraph});
};

module.exports = function(context, payload, done) {
  async.parallel({
    proto: fetchData(payload.proto),
    config: fetchData(payload.config)
  }, function(err, response) {
    var builder = ProtoBuf.loadProto(response.proto);

    var result = TextFormat.parse(builder, 'caffe.NetParameter', response.config);
    var graph = buildGraph(result.message);

    layoutGraph(graph, function(err, finalGraph) {
      context.dispatch('GRAPH_LOADED', { graph: finalGraph });
    });
    done();
  });
};
