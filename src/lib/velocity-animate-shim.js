// Shim to avoid requiring Velocity in Node environments, since it
// requires window. Note that this just no-ops the components so
// that they'll render, rather than doing something clever like
// statically rendering the end state of any provided animations.
//
// TODO(finneganh): Circle back on jsdom to see if we can run full
// Velocity with it in place. This come up in:
// https://github.com/twitter-fabric/velocity-react/issues/119
// but there may have been different loading issues in that case,
// not a global incompatibility with jsdom.
if (
  typeof window === 'undefined' ||
  typeof navigator === 'undefined' ||
  navigator.userAgent.indexOf('Node.js') !== -1 ||
  navigator.userAgent.indexOf('jsdom') !== -1
) {
  var Velocity = function() {};
  Velocity.Utilities = {};
  Velocity.Utilities.removeData = function() {};
  Velocity.velocityReactServerShim = true;
  module.exports = Velocity;
} else {
  // this is how velocity-ui finds the Velocity instance, so lets make sure we find the right instance
  var g = window.jQuery || window.Zepto || window;

  // require Velocity if it doesn't already exist
  module.exports = g.Velocity ? g.Velocity : require('velocity-animate');
}
