"use strict";

var React = require('react');

var PatchPanel = require('./PatchPanel.jsx');

module.exports = React.createClass({
  displayName: 'App',
  propTypes: {
    context: React.PropTypes.object.isRequired
  },
  render: function() {
    return (
      <div id="panels">
        <PatchPanel title="Node #1" id="node-1" context={this.props.context}/>
      </div>
    );
  }
});

