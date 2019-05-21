// Convenience main entrypoint if you are running with destructuring support:
//
//   import {VelocityComponent, VelocityTransitionGroup} from 'velocity-react';
//
// You can also require just the component(s) you're using:
//
//   var VelocityComponent = require('velocity-react/velocity-component');
//
// Note that if you want to use UI Pack you will need to require 'velocity' and
// 'velocity.ui' at a top level in your app:
//
//   require('velocity');
//   require('velocity-animate/velocity.ui');

export { default as VelocityComponent } from './velocity-component';
export { default as velocityHelpers } from './velocity-helpers';
export {
  default as VelocityTransitionGroup,
} from './velocity-transition-group';
