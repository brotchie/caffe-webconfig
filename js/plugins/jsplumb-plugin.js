/* Makes the jsPlumb instance available
 * via the component context. */
"use strict";

module.exports = {
  name: 'JSPlumbPlugin',
  plugContext: function plugContext(options) {
    return {
      plugComponentContext: function(componentContext) {
        componentContext.jsPlumb = options.jsPlumb;
      }
    };
  },
};
