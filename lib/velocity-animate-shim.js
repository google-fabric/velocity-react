// Shim to avoid requiring Velocity in Node environments, since it
// requires window. Note that this just no-ops the components so
// that they'll render, rather than doing something clever like
// statically rendering the end state of any provided animations.
if (typeof window !== 'undefined') {
  module.exports = require('velocity-animate');
} else {
  var Velocity = function () {};
  Velocity.velocityReactServerShim = true;
  module.exports = Velocity;
}
