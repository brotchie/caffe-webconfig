"use strict";

var React = require('react')
  , _ = require('lodash')
  , interact = require('interact.js');

var moveNodeAction = require('../actions/moveNodeAction');
var createCurvedPath = require('../utils/curves').createCurvedPath;

var getOrderedFields = require('../utils/fields').getOrderedFields
  , resolveEnum = require('../utils/fields').resolveEnum;

var Panel = React.createClass({
  displayName: 'PatchPanel',
  propTypes: {
    context: React.PropTypes.object.isRequired,
    message: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
    onDragStart: React.PropTypes.func.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDrag: React.PropTypes.func.isRequired
  },
  componentDidMount() {
    this.interact = interact(this.getDOMNode());
    this.interact.draggable({
      onstart: (e) => {
        this.props.onDragStart(this.props.id);
      },
      onmove: (e) => {
        this.props.onDrag(this.props.id, {
          dx: e.clientX - e.clientX0,
          dy: e.clientY - e.clientY0
        });
      },
      onend: (e) => {
        this.props.onDragEnd(this.props.id, {
          dx: e.clientX - e.clientX0,
          dy: e.clientY - e.clientY0
        });
      }
    });
  },
  renderFields(message) {
    var fields = getOrderedFields(message.$type);

    var nativeComponents = _.map(fields.native || [], T => {
      var value = message[T.name];

      var empty = T.repeated ?
        value.length === 0 :
        value ===  null;

      if (empty)
        return null;

      if (T.type.name === 'enum') {
          value = resolveEnum(T, value);
      }
      return (
        <div key={T.name} className="patch-panel-prop">
            <span className="patch-panel-prop-name">{T.name}</span>
            <span className="patch-panel-prop-value">{value}</span>
        </div>
      );
    });

    var nestedComponents = _.map(fields.nested || [], T => {
      var value = message[T.name];

      var empty = T.repeated ?
        value.length === 0 :
        value ===  null;

      if (empty)
        return null;

      if (!T.repeated) {
        value = [value];
      }

      return _.map(value, (nestedMessage, index) => {
        return (
          <div key={T.name + '-' + index} className="patch-panel-nested">
            <div className="patch-panel-nested-header">
              {T.name}
            </div>
            {this.renderFields(nestedMessage)}
          </div>
        );
      });
    });

    return [
      nativeComponents,
      nestedComponents
    ];
  },
  render() {
    var style = { left: this.props.x, top: this.props.y };

    var message = this.props.message;

    /*todo!!!
     - Render nested fields with a single pixel margin on the left.
     - Separate the field generating methods so we can call them
     recursively.*/

    return (
      <div className="patch-panel" id={this.props.id} style={style}>
        <div className="patch-panel-header">{message.name}</div>
        <div className="patch-panel-content">
            {this.renderFields(message)}
        </div>
      </div>
    );
  }
});

var SRC_OFFSET = { x: 198, y: 20 }
  , TGT_OFFSET = { x: 2, y: 20 };

var GraphViewer = React.createClass({
  displayName: 'GraphViewer',
  propTypes: {
    context: React.PropTypes.object.isRequired,
    graph: React.PropTypes.object.isRequired
  },
  getInitialState() {
    return {
      graph: this.props.graph
    };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      graph: nextProps.graph
    });
  },
  onDragStart(id) {},
  onDrag(id, pos) {
    this.setState({
      graph: this.props.graph.updateIn(['nodes', id], (node) => {
        return node.set('x', node.get('x') + pos.dx)
                   .set('y', node.get('y') + pos.dy);
      })
    });
  },
  onDragEnd(id, pos) {
    var {x, y} = this.props.graph.getIn(['nodes', id]).toJS();
    this.props.context.executeAction(moveNodeAction, {
      id: id,
      newX: x + pos.dx,
      newY: y + pos.dy
    });
  },
  render() {
    var graph = this.state.graph.toJS();

    var updateMethods = {
      onDragStart: this.onDragStart,
      onDragEnd: this.onDragEnd,
      onDrag: this.onDrag
    };

    var panels = _.map(graph.nodes, (node, id) => {
      return <Panel key={id} id={id} message={node.message} x={node.x} y={node.y}
                    context={this.props.context} {...updateMethods}/>
    });

    var shapes = _.map(graph.edges, (edge, id) => {
      var {source, target} = edge;
      var srcpos = _.clone(graph.nodes[source])
        , tgtpos = _.clone(graph.nodes[target]);

      srcpos.x += SRC_OFFSET.x;
      srcpos.y += SRC_OFFSET.y;

      tgtpos.x += TGT_OFFSET.x;
      tgtpos.y += TGT_OFFSET.y;

      var path = createCurvedPath(srcpos, tgtpos);

      return [
        <path key={id + '-path-2'} d={path} stroke="white" fill="none" strokeWidth="6"/>,
        <path key={id + '-path'} d={path} stroke="#888888" fill="none" strokeWidth="3"/>,
        <circle key={id + '-source-end'} fill="yellow" r="5" cx={srcpos.x} cy={srcpos.y}/>,
            <circle key={id + '-target-end'} fill="green" r="5" cx={tgtpos.x} cy={tgtpos.y}/>
      ];
    });

    return (
      <div id="main-canvas">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="below">
            {shapes}
        </svg>
        {panels}
      </div>
    );
  }
});


module.exports = GraphViewer;
