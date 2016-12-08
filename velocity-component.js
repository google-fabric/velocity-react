/*
Copyright (c) 2015 Twitter, Inc. and other contributors

Component to add Velocity animations to one or more children. Wraps a single child without adding
additional DOM nodes.

The API attempts to be as declarative as possible. A single animation property declares what
animation the child should have. If that property changes, this component applies the new animation
to the child on the next tick.

By default, the animation is not run when the component is mounted. Instead, Velocity's "finish"
command is used to jump to the animation's end state. For a component that animates out of and
back in to a default state, this allows the parent to specify the "animate into" animation as
the default, and therefore not have to distinguish between the initial state and the state to
return to after animating away.

Properties:
 animation: Either an animation key or hash defining the animation. See Velocity's documentation
   for what this can be. (It is passed to Velocity exactly.)
 runOnMount: If true, runs the animation even when the component is first mounted.
 targetQuerySelector: By default, this component's single child is animated. If targetQuerySelector
   is provided, it is used to select descendants to apply the animation to. Use with caution, only
   when you're confident that React's reconciliation will preserve these nodes during animation.
   Also note querySelectorAll's silly behavior w.r.t. pruning results when being called on a node.
   A special value of "children" will use the direct children of the node, since there isn't a
   great way to specify that to querySelectorAll.

Unrecognized properties are passed as options to Velocity (e.g. "duration", "delay", "loop").

Methods:
 runAnimation: Triggers the animation immediately. Useful for when you want an animation that
   corresponds to an event but not a particular model state change (e.g. a "bump" when a click
   occurs).
*/

var _ = {
  forEach: require('lodash/collection/forEach'),
  isEqual: require('lodash/lang/isEqual'),
  keys: require('lodash/object/keys'),
  omit: require('lodash/object/omit'),
};
var React = require('react');
var ReactDOM = require('react-dom');
var Velocity = require('./lib/velocity-animate-shim');

var VelocityComponent = React.createClass({
  displayName: 'VelocityComponent',

  propTypes: {
    animation: React.PropTypes.any,
    children: React.PropTypes.element.isRequired,
    runOnMount: React.PropTypes.bool,
    targetQuerySelector: React.PropTypes.string,
    // Any additional properties will be sent as options to Velocity
  },

  getDefaultProps: function () {
    return {
      animation: null,
      runOnMount: false,
      targetQuerySelector: null,
    }
  },

  componentDidMount: function () {
    this.runAnimation();

    // Jump to the end so that the component has the visual appearance of the animation having
    // been run to completion.
    if (this.props.runOnMount !== true) {
      this._finishAnimation();
    }
  },

  componentWillUpdate: function (newProps, newState) {
    if (!_.isEqual(newProps.animation, this.props.animation)) {
      this._stopAnimation();
      this._scheduleAnimation();
    }
  },

  componentWillUnmount: function () {
    this._stopAnimation();
    this._clearVelocityCache(this._getDOMTarget());
  },

  // It's ok to call this externally! By default the animation will be queued up. Pass stop: true in
  // to stop the current animation before running. Pass finish: true to finish the current animation
  // before running.
  runAnimation: function (config) {
    config = config || {};

    this._shouldRunAnimation = false;

    if (!this.isMounted() || this.props.animation == null) {
      return;
    }

    if (config.stop) {
      Velocity(this._getDOMTarget(), 'stop', true);
    } else if (config.finish) {
      Velocity(this._getDOMTarget(), 'finishAll', true);
    }

    // Delegate all props except for the ones that we have specified as our own via propTypes.
    var opts = _.omit(this.props, _.keys(this.constructor.propTypes));
    Velocity(this._getDOMTarget(), this.props.animation, opts);
  },

  // We trigger animations on a new tick because of a Velocity bug where adding a
  // multi-step animation from within a complete callback causes the first 2 animations to run
  // simultaneously.
  _scheduleAnimation: function () {
    if (this._shouldRunAnimation) {
      return;
    }

    this._shouldRunAnimation = true;
    setTimeout(this.runAnimation, 0);
  },

  // Returns one or more DOM nodes to apply the animation to. This is checked every time we start
  // or stop an animation, which means that if an animation is proceeding but the element is removed
  // from the page, it will run its course rather than ever being stopped. (We go this route
  // because of difficulty in tracking what animations are currently being animated, due to both
  // chained animations and the need to be able to "stop" an animation before it begins.)
  _getDOMTarget: function () {
    var node = ReactDOM.findDOMNode(this);

    if (this.props.targetQuerySelector === 'children') {
      return node.children;
    } else if (this.props.targetQuerySelector != null) {
      return node.querySelectorAll(this.props.targetQuerySelector);
    } else {
      return node;
    }
  },

  _finishAnimation: function () {
    Velocity(this._getDOMTarget(), 'finishAll', true);
  },

  _stopAnimation: function () {
    Velocity(this._getDOMTarget(), 'stop', true);
  },

  // Velocity keeps extensive caches for all animated elements to minimize layout thrashing.
  // This can cause a serious memory leak, keeping references to unmounted elements as well
  // completion handlers and associated react objects. This crudely clears these references.
  _clearVelocityCache: function (target) {
    if (target.length) {
      _.forEach(target, this._clearVelocityCache)
    } else {
      Velocity.Utilities.removeData(target, ['velocity', 'fxqueue']);
    }
  },

  // This component does not include any DOM footprint of its own, so instead we return our
  // child out of render(). (Render must only return a single element, which restricts us to
  // one child. If you want to animate multiple children, provide your own wrapper element and
  // use the "targetQuerySelector" prop to target its children.)
  render: function () {
    return this.props.children;
  }
});

module.exports = VelocityComponent;
