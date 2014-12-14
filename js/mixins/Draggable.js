"use strict";

module.exports = {
  componentDidMount: function() {
    if (!this.props.context)
      throw Error('Draggable mixin requires context passed as property.');
    this.props.context.jsPlumb.draggable(this.getDOMNode());
  },
  componentWillUnmount: function() {
    var dom = this.getDOMNode();
    if (dom._katavorioDrag) {
      dom._katavorioDrag.destroy();
    }
  }
};
