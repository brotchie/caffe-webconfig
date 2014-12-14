"use strict";

var React = require('react');
var Draggable = require('../mixins/Draggable.js');

module.exports = React.createClass({
  displayName: 'PatchPanel',
  propTypes: {
    context: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },
  mixins: [Draggable],
  render: function() {
    return (
      <div className="patch-panel" id={this.props.id}>
        <div className="patch-panel-header">{this.props.title}</div>
        <div className="patch-panel-content">{this.props.children}</div>
      </div>
    );
  }
});

