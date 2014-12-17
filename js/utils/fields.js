"use strict";

var _ = require('lodash');

var _cache = {}
  , _enum_cache = {};

var ORDERING = {
  '.caffe.LayerParameter': {
    remove: ['top', 'bottom'],
    promote: ['name', 'type'],
    demote: ['include', 'exclude']
  }
};

var orderFields = function(fields, orderspec) {
  if (orderspec === undefined) {
    return _.sortBy(fields, 'name');
  }

  var ordered = 
    _(fields)
      .sortBy('name')
      .filter(T => {
        return !_.contains(orderspec.remove, T.name);
      })
      .groupBy(T => {
        if (_.contains(orderspec.promote, T.name)) {
          return 'promoted';
        } else if (_.contains(orderspec.demote, T.name)) {
          return 'demoted';
        } else {
          return 'normal';
        }
      })
      .value();
  return (ordered.promoted || [])
      .concat(ordered.normal || [])
      .concat(ordered.demoted || []);
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
