"use strict";

module.exports = function(context, payload, done) {
  context.dispatch('MOVE_NODE', payload);
  done();
};
