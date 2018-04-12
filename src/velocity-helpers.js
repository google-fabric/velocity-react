// Copyright (c) 2015 Twitter, Inc. and other contributors

var _ = {
  isObject: require('lodash/isObject'),
};
var Velocity = require('./lib/velocity-animate-shim');

var effectCounter = 0;

// Takes a Velocity "UI pack effect" definition and registers it with a unique key, returning that
// key (to later pass as a value for the "animation" property). Takes an optional suffix, which can
// be "In" or "Out" to modify UI Pack's behavior.
//
// Unlike what you get from passing a style hash to VelocityComponent's "animation" property,
// Velocity "UI pack effects" can have chained animation calls and specify a "defaultDuration", and
// also can take advantage of "stagger" and "reverse" options on the VelocityComponent.
//
// You will need to manually register the UI Pack with the global Velocity in your application with:
//
//   require('velocity');
//   require('velocity-animate/velocity.ui');
//
// See: http://julian.com/research/velocity/#uiPack
//
// Typical usage:
//
// var Animations = {
//   down: VelocityHelpers.registerEffect({
//     defaultDuration: 1100,
//     calls: [
//       [{
//         transformOriginX: [ '50%', '50%' ],
//         transformOriginY: [ 0, 0 ],
//         rotateX: [0, 'spring'],
//       }, 1, {
//         delay: 100,
//         easing: 'ease-in',
//       }]
//     ],
//   }),
//
//   up: VelocityHelpers.registerEffect({
//     defaultDuration: 200,
//     calls: [
//       [{
//         transformOriginX: [ '50%', '50%' ],
//         transformOriginY: [ 0, 0 ],
//         rotateX: 160,
//       }]
//     ],
//   }),
// };
// ...
// <VelocityComponent animation={this.state.isUp ? Animations.up : Animations.down}>
//   ...
// <Velocity>
function registerEffect(suffix, animation) {
  if (_.isObject(suffix)) {
    animation = suffix;
    suffix = '';
  }

  var key = 'VelocityHelper.animation.' + effectCounter++ + suffix;

  // No-op on the server for now.
  if (Velocity.velocityReactServerShim) {
    return key;
  }

  if (Velocity.RegisterEffect === undefined) {
    throw "Velocity.RegisterEffect not found. You need to require 'velocity-animate/velocity.ui' at a top level for UI Pack.";
  }

  Velocity.RegisterEffect(key, animation);
  return key;
}

module.exports = {
  registerEffect: registerEffect,
};
