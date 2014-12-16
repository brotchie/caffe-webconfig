"use strict";

var _ = require('lodash');

var _cache = {}
  , _enum_cache = {};

var ORDERING = {
  '.caffe.LayerParameter': {
    remove: ['top', 'bottom'],
    promote: ['name', 'type']
  }
};

var orderFields = function(fields, orderspec) {
  var ordered = 
    _(fields)
      .sortBy('name')
      .filter(T => {
        return !_.contains(orderspec.remove, T.name);
      })
      .groupBy(T => {
        return _.contains(orderspec.promote, T.name) ? 'promoted' : 'normal';
      })
      .value();
  return (ordered.promoted || []).concat(ordered.normal || []);
};

var resolveEnum = function(enumT, value) {
  var fqn = enumT.fqn();

  if (!_enum_cache[fqn]) {
    _enum_cache[fqn] = _.invert(enumT.resolvedType.object);
  }

  return _enum_cache[fqn][value];
};

var getOrderedFields = function(messageT) {
  var fqn = messageT.fqn()
    , orderspec = ORDERING[fqn];

  /* Just return the default ordering if there's
   * no explicit ordering specification. */
  if (!orderspec) {
    return messageT.children;
  }

  if (_cache[fqn]) {
    return _cache[fqn];
  }

  var grouped = _(messageT.children)
      .filter(T => T.className === 'Message.Field')
      .groupBy(T => T.type.name === 'message' ? 'nested' : 'native')
      .value();

  var result = {
    native: orderFields(grouped.native || [], orderspec),
    nested: orderFields(grouped.nested || [], orderspec)
  };

  _cache[fqn] = result;

  return result;
};

exports.getOrderedFields = getOrderedFields;
exports.resolveEnum = resolveEnum;
