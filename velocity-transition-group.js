/*
Copyright (c) 2015 Twitter, Inc. and other contributors

Component to add Velocity animations around React transitions. Delegates to the React TransitionGroup
addon.

Properties
  enter: Animation to run on a child component being added
  leave: Animation to run on a child component leaving
  runOnMount: if true, runs the "enter" animation on the elements that exist as children when this
    component is mounted.

Any additional properties (e.g. "className", "component") will be passed to the internal
TransitionGroup.

"enter" and "leave" should either be a string naming an animation, or a hash with an
"animation" key that can either be a string itself, or a hash of style attributes to animate (this
value is passed to Velocity its the first arg).

If "enter" or "leave" is a hash, it can additionally have a "style" value that is applied the tick
before the Velocity animation starts. Use this for non-animating properties (like "position") that
are prerequisites for correct animation. The style value is applied using Velocity's JS -> CSS
routines, which may differ from React's.

Any hash entries beyond "animation" and "style" are passed in an options hash to Velocity. Use this
for options like "stagger", "reverse", &tc.

Statics
  disabledForTest: Set this to true globally to turn off all custom animation logic. Instead, this
    component will behave like a vanilla TransitionGroup.

Inspired by https://gist.github.com/tkafka/0d94c6ec94297bb67091
*/

var _ = {
  each: require('lodash/collection/each'),
  extend: require('lodash/object/extend'),
  keys: require('lodash/object/keys'),
  omit: require('lodash/object/omit'),
  pluck: require('lodash/collection/pluck'),
};
var React = require('react/addons');
var Velocity;
if (typeof window !== 'undefined') {
  Velocity = require('velocity-animate');
} else {
  Velocity = function stubbedVelocity() {};
}

// Internal wrapper for the transitioned elements. Delegates all child lifecycle events to the
// parent VelocityTransitionGroup so that it can co-ordinate animating all of the elements at once.
var VelocityTransitionGroupChild = React.createClass({
  displayName: 'VelocityTransitionGroupChild',

  propTypes: {
    children: React.PropTypes.element.isRequired,
    willAppearFunc: React.PropTypes.func.isRequired,
    willEnterFunc: React.PropTypes.func.isRequired,
    willLeaveFunc: React.PropTypes.func.isRequired,
  },

  componentWillAppear: function (doneFn) {
    if (typeof window !== 'undefined') {
      this.props.willAppearFunc(React.findDOMNode(this), doneFn);
    }
  },

  componentWillEnter: function (doneFn) {
    if (typeof window !== 'undefined') {
      this.props.willEnterFunc(React.findDOMNode(this), doneFn);
    }
  },

  componentWillLeave: function (doneFn) {
    if (typeof window !== 'undefined') {
      this.props.willLeaveFunc(React.findDOMNode(this), doneFn);
    }
  },

  render: function () {
    return React.Children.only(this.props.children);
  },
});

var VelocityTransitionGroup = React.createClass({
  displayName: 'VelocityTransitionGroup',

  statics: {
    disabledForTest: false, // global, mutable, for disabling animations during test
  },

  propTypes: {
    runOnMount: React.PropTypes.bool,
    enter: React.PropTypes.any,
    leave: React.PropTypes.any,
    children: React.PropTypes.any,
  },

  getDefaultProps: function() {
    return {
      runOnMount: false,
      enter: null,
      leave: null,
    };
  },

  componentWillMount: function () {
    this._scheduled = false;
    this._entering = [];
    this._leaving = [];
  },

  componentWillUnmount: function () {
    this._entering = [];
    this._leaving = [];
  },

  render: function () {
    // Pass any props that are not our own on into the TransitionGroup delegate.
    var transitionGroupProps = _.omit(this.props, _.keys(this.constructor.propTypes));

    // Without our custom childFactory, we just get a default TransitionGroup that doesn't do
    // anything special at all.
    if (!this.constructor.disabledForTest) {
      transitionGroupProps.childFactory = this._wrapChild;
    }

    return React.createElement(React.addons.TransitionGroup, transitionGroupProps, this.props.children);
  },

  childWillAppear: function (node, doneFn) {
    if (this.props.runOnMount) {
      this.childWillEnter(node, doneFn);
    } else {
      this._finishAnimation(node, this.props.enter);
      
      // Important to tick over so that any callbacks due to finishing the animation complete first.
      // isMounted check necessary to avoid exception in tests, which can mount and unmount a
      // component before this runs over, as the "doneFn" callback does a ref lookup rather than
      // closing over the component.
      //
      // Using setTimeout so that doneFn gets called even when the tab is hidden.
      var self = this;
      window.setTimeout(function () {
        if (self.isMounted()) {
          doneFn();
        }
      }, 0);
    }
  },

  childWillEnter: function (node, doneFn) {
    if (this._shortCircuitAnimation(doneFn)) return;

    // By finishing a "leave" on the element, we put it in the right state to be animated in. Useful
    // if "leave" includes a rotation or something that we'd like to have as our starting point, for
    // symmetry.
    this._finishAnimation(node, this.props.leave);

    // We're not going to start the animation for a tick, so set the node's display to none so that
    // it doesn't flash in.
    Velocity.CSS.setPropertyValue(node, 'display', 'none');

    this._entering.push({
      node: node,
      doneFn: doneFn,
    });

    this._schedule();
  },

  childWillLeave: function (node, doneFn) {
    if (this._shortCircuitAnimation(doneFn)) return;

    this._leaving.push({
      node: node,
      doneFn: doneFn,
    });

    this._schedule();
  },

  // document.hidden check is there because animation completion callbacks won't fire (due to
  // chaining off of rAF), which would prevent entering / leaving DOM nodes from being cleaned up
  // while the tab is hidden.
  //
  // Returns true if this did short circuit, false if lifecycle methods should continue with
  // their animations.
  _shortCircuitAnimation: function (doneFn) {
    if (document.hidden || (this._parseAnimationProp(this.props.leave).animation == null)) {
      if (this.isMounted()) {
        doneFn();
      }

      return true;      
    } else {
      return false;
    }
  },

  _schedule: function () {
    if (this._scheduled) {
      return;
    }

    this._scheduled = true;

    // Need rAF to make sure we're in the same event queue as Velocity from here out. Important
    // for avoiding getting wrong interleaving with Velocity callbacks.
    window.requestAnimationFrame(this._runAnimations);
  },

  _runAnimations: function () {
    this._scheduled = false;

    this._runAnimation(true, this._entering, this.props.enter);
    this._runAnimation(false, this._leaving, this.props.leave);

    this._entering = [];
    this._leaving = [];
  },

  // Used to parse out the 'enter' and 'leave' properties. Handles cases where they are omitted
  // as well as when they are just strings and not hashes of animation and options.
  _parseAnimationProp: function (animationProp) {
    var animation, opts, style;

    if (typeof animationProp === 'string') {
      animation = animationProp;
      style = null;
      opts = {};
    } else {
      animation = (animationProp != null) ? animationProp.animation : null;
      style = (animationProp != null) ? animationProp.style : null;
      opts = _.omit(animationProp, 'animation', 'style');
    }

    return {
      animation: animation,
      style: style,
      opts: opts,
    };
  },

  _runAnimation: function (entering, queue, animationProp) {
    if (!this.isMounted() || queue.length === 0) {
      return;
    }

    var nodes = _.pluck(queue, 'node');
    var doneFns = _.pluck(queue, 'doneFn');

    var parsedAnimation = this._parseAnimationProp(animationProp);
    var animation = parsedAnimation.animation;
    var style = parsedAnimation.style;
    var opts = parsedAnimation.opts;

    // Clearing display reverses the behavior from childWillAppear where all elements are added with
    // display: none to prevent them from flashing in before the animation starts. We don't do this
    // for the fade/slide animations or any animation that ends in "In," since Velocity will handle
    // it for us.
    if (entering && !(/^(fade|slide)/.test(animation) || /In$/.test(animation))) {
      style = _.extend({
        display: ''
      }, style);
    }

    // Because Safari can synchronously repaint when CSS "display" is reset, we set styles for all
    // browsers before the rAF tick below that starts the animation. This way you know in all
    // cases that you need to support your static styles being visible on the element before
    // the animation begins. 
    if (style != null) {
      _.each(style, function (value, key) {
        Velocity.hook(nodes, key, value);
      });
    }

    var self = this;
    var completeFn = function () {
      if (!self.isMounted()) {
        return;
      }

      doneFns.map(function (doneFn) { doneFn(); });
    };

    // For nodes that are entering, we tell the TransitionGroup that we're done with them
    // immediately. That way, they can be removed later before their entering animations complete.
    // If we're leaving, we stop current animations (which may be partially-completed enter
    // animations) so that we can then animate out. Velocity typically makes these transitions
    // very smooth, correctly animating from whatever state the element is currently in.
    if (entering) {
      completeFn();
      completeFn = null;
    } else {
      Velocity(nodes, 'stop');
    }

    // Bit of a hack. Without this rAF, sometimes an enter animation doesn't start running, or is
    // stopped before getting anywhere. This should get us on the other side of both completeFn and
    // any _finishAnimation that's happening.
    window.requestAnimationFrame(function () {
      Velocity(nodes, animation, _.extend({}, opts, {
        complete: completeFn
      }));
    });
  },

  _finishAnimation: function (node, animationProp) {
    var parsedAnimation = this._parseAnimationProp(animationProp);
    var animation = parsedAnimation.animation;
    var style = parsedAnimation.style;
    var opts = parsedAnimation.opts;

    if (style != null) {
      _.each(style, function (value, key) {
        Velocity.hook(node, key, value);
      });
    }

    if (animation != null) {
      // Opts are relevant even though we're immediately finishing, since things like "display"
      // can affect the animation outcome.

      Velocity(node, animation, opts);
      Velocity(node, 'finishAll', true);
    }
  },

  _wrapChild: function (child) {
    return React.createElement(VelocityTransitionGroupChild, {
      willAppearFunc: this.childWillAppear,
      willEnterFunc: this.childWillEnter,
      willLeaveFunc: this.childWillLeave,
    }, child);
  },
});

module.exports = VelocityTransitionGroup;
