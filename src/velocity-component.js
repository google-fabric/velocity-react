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
 interruptBehavior: Sets how the previous animation should behave when the "animation" prop is
   changed before it’s done. Default is "stop", which halts the animation where it is. "finish"
   will jump the animation to its completed appearance. "queue" will run the new animation after
   the previous one has finished.

Unrecognized properties are passed as options to Velocity (e.g. "duration", "delay", "loop").

Methods:
 runAnimation: Triggers the animation immediately. Useful for when you want an animation that
   corresponds to an event but not a particular model state change (e.g. a "bump" when a click
   occurs).
*/
/* eslint react/no-find-dom-node: 0 */

var _ = {
  forEach: require('lodash/forEach'),
  isEqual: require('lodash/isEqual'),
  keys: require('lodash/keys'),
  omit: require('lodash/omit'),
};

var React = require('react');
var ReactDOM = require('react-dom');
var PropTypes = require('prop-types');
var Velocity = require('./lib/velocity-animate-shim');

class VelocityComponent extends React.Component {
  constructor(props) {
    super(props);

    this._animationTimeout = null;

    // This public method is kept as self-bound to maintain compatibility with the React.createClass
    // version of the component.
    this.runAnimation = this.runAnimation.bind(this);
  }

  componentDidMount() {
    this.runAnimation();

    // Jump to the end so that the component has the visual appearance of the animation having
    // been run to completion.
    if (this.props.runOnMount !== true) {
      this._finishAnimation();
    }
  }

  componentDidUpdate(oldProps) {
    if (!_.isEqual(oldProps.animation, this.props.animation)) {
      if (this.props.interruptBehavior === 'stop') {
        this._stopAnimation();
      } else if (this.props.interruptBehavior === 'finish') {
        this._finishAnimation();
      }

      this._scheduleAnimation();
    }
  }

  componentWillUnmount() {
    this._stopAnimation();
    this._clearVelocityCache(this._getDOMTarget());

    if (this._animationTimeout) {
      clearTimeout(this._animationTimeout);
    }
  }

  // It's ok to call this externally! By default the animation will be queued up. Pass stop: true in
  // to stop the current animation before running. Pass finish: true to finish the current animation
  // before running.
  runAnimation(config) {
    config = config || {};

    this._animationTimeout = null;

    if (this.props.animation == null) {
      return;
    }

    if (config.stop) {
      Velocity(this._getDOMTarget(), 'stop', true);
    } else if (config.finish) {
      Velocity(this._getDOMTarget(), 'finishAll', true);
    }

    // Delegate all props except for the ones that we have specified as our own via propTypes.
    var opts = _.omit(this.props, _.keys(VelocityComponent.propTypes));
    Velocity(this._getDOMTarget(), this.props.animation, opts);
  }

  // We trigger animations on a new tick because of a Velocity bug where adding a
  // multi-step animation from within a complete callback causes the first 2 animations to run
  // simultaneously.
  _scheduleAnimation() {
    if (this._animationTimeout) {
      return;
    }

    this._animationTimeout = setTimeout(this.runAnimation, 0);
  }

  // Returns one or more DOM nodes to apply the animation to. This is checked every time we start
  // or stop an animation, which means that if an animation is proceeding but the element is removed
  // from the page, it will run its course rather than ever being stopped. (We go this route
  // because of difficulty in tracking what animations are currently being animated, due to both
  // chained animations and the need to be able to "stop" an animation before it begins.)
  _getDOMTarget() {
    var node = ReactDOM.findDOMNode(this);

    if (this.props.targetQuerySelector === 'children') {
      return node.children;
    } else if (this.props.targetQuerySelector != null) {
      return node.querySelectorAll(this.props.targetQuerySelector);
    } else {
      return node;
    }
  }

  _finishAnimation() {
    Velocity(this._getDOMTarget(), 'finishAll', true);
  }

  _stopAnimation() {
    Velocity(this._getDOMTarget(), 'stop', true);
  }

  // Velocity keeps extensive caches for all animated elements to minimize layout thrashing.
  // This can cause a serious memory leak, keeping references to unmounted elements as well
  // completion handlers and associated react objects. This crudely clears these references.
  _clearVelocityCache(target) {
    if (target.length) {
      _.forEach(target, this._clearVelocityCache);
    } else {
      Velocity.Utilities.removeData(target, ['velocity', 'fxqueue']);
    }
  }

  // This component does not include any DOM footprint of its own, so instead we return our
  // child out of render(). (Render must only return a single element, which restricts us to
  // one child. If you want to animate multiple children, provide your own wrapper element and
  // use the "targetQuerySelector" prop to target its children.)
  render() {
    return this.props.children;
  }
}

VelocityComponent.propTypes = {
  animation: PropTypes.any,
  children: PropTypes.element.isRequired,
  runOnMount: PropTypes.bool,
  targetQuerySelector: PropTypes.string,
  interruptBehavior: PropTypes.string,
  // Any additional properties will be sent as options to Velocity
};

VelocityComponent.defaultProps = {
  animation: null,
  runOnMount: false,
  targetQuerySelector: null,
  interruptBehavior: 'stop',
};

module.exports = VelocityComponent;
