"use strict";

var React = require('react');

var GraphViewer = require('./GraphViewer.jsx');

var StoreMixin = require('fluxible').StoreMixin
  , GraphStore = require('../stores/GraphStore');

module.exports = React.createClass({
  displayName: 'App',
  propTypes: {
    context: React.PropTypes.object.isRequired
  },
  mixins: [StoreMixin],
  statics: {
    storeListeners: [GraphStore]
  },
  onChange: function() {
    this.setState(this.getStore(GraphStore).getState());
  },
  getInitialState: function() {
    return this.getStore(GraphStore).getState();
  },
  render: function() {
    var context = this.props.context;

   return (
     <GraphViewer context={this.props.context} graph={this.state.graph}/>
   );
  }
});

