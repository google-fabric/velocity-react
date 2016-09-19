/*
Copyright (c) 2015 Twitter, Inc. and other contributors

Component to add Velocity animations around React transitions. Delegates to the React TransitionGroup
addon.

Properties
  enter: Animation to run on a child component being added
  leave: Animation to run on a child component leaving
  runOnMount: if true, runs the "enter" animation on the elements that exist as children when this
    component is mounted.
  enterHideStyle/enterShowStyle: see below.

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

By default, this component will immediately hide all entering children with display: 'none', and
unhide them one tick later with display: ''. This is done so that we can coalesce multiple enters
into a single animation, and we want to avoid any popping of elements in while they're collected. If
you prefer a different way of hiding these elements so that e.g. geometry can be immediately
calculated, use the enterHideStyle and enterShowStyle props to provide alternate style hashes for
hiding and revealing entering elements.

Statics
  disabledForTest: Set this to true globally to turn off all custom animation logic. Instead, this
    component will behave like a vanilla TransitionGroup.

Inspired by https://gist.github.com/tkafka/0d94c6ec94297bb67091
*/

var _ = {
  each: require('lodash/collection/each'),
  extend: require('lodash/object/extend'),
  forEach: require('lodash/collection/forEach'),
  isEqual: require('lodash/lang/isEqual'),
  keys: require('lodash/object/keys'),
  omit: require('lodash/object/omit'),
  pluck: require('lodash/collection/pluck'),
};
var React = require('react');
var ReactDOM = require('react-dom');
var ReactTransitionGroup = require('react-addons-transition-group');
var Velocity = require('./lib/velocity-animate-shim');

// Shim requestAnimationFrame for browsers that don't support it, in particular IE 9.
var shimRequestAnimationFrame =
  (typeof window !== 'undefined') && (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 0) }
  );

// Fix 'Invalid calling object' error in IE
shimRequestAnimationFrame = (typeof window !== 'undefined') &&  shimRequestAnimationFrame.bind(window);

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
    this.props.willAppearFunc(ReactDOM.findDOMNode(this), doneFn);
  },

  componentWillEnter: function (doneFn) {
    this.props.willEnterFunc(ReactDOM.findDOMNode(this), doneFn);
  },

  componentWillLeave: function (doneFn) {
    this.props.willLeaveFunc(ReactDOM.findDOMNode(this), doneFn);
  },

  componentWillUnmount: function () {
    // Clear references from velocity cache.
    Velocity.Utilities.removeData(ReactDOM.findDOMNode(this), ['velocity', 'fxqueue']);
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
    enterHideStyle: React.PropTypes.object,
    enterShowStyle: React.PropTypes.object,
  },

  getDefaultProps: function() {
    return {
      runOnMount: false,
      enter: null,
      leave: null,
      enterHideStyle: {
        display: 'none',
      },
      enterShowStyle: {
        display: '',
      },
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
    if (!this.constructor.disabledForTest && !Velocity.velocityReactServerShim) {
      transitionGroupProps.childFactory = this._wrapChild;
    }

    return React.createElement(ReactTransitionGroup, transitionGroupProps, this.props.children);
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
    if (this._shortCircuitAnimation(this.props.enter, doneFn)) return;

    // By finishing a "leave" on the element, we put it in the right state to be animated in. Useful
    // if "leave" includes a rotation or something that we'd like to have as our starting point, for
    // symmetry.
    // We use overrideOpts to prevent any "begin" or "complete" callback from triggering in this case, since
    // it doesn't make a ton of sense.
    this._finishAnimation(node, this.props.leave, {begin: undefined, complete: undefined});

    // We're not going to start the animation for a tick, so set the node's display to none (or any
    // custom "hide" style provided) so that it doesn't flash in.
    _.forEach(this.props.enterHideStyle, function (val, key) {
      Velocity.CSS.setPropertyValue(node, key, val);
    });

    this._entering.push({
      node: node,
      doneFn: doneFn,
    });

    this._schedule();
  },

  childWillLeave: function (node, doneFn) {
    if (this._shortCircuitAnimation(this.props.leave, doneFn)) return;

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
  _shortCircuitAnimation: function (animationProp, doneFn) {
    if (document.hidden || (this._parseAnimationProp(animationProp).animation == null)) {
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
    shimRequestAnimationFrame(this._runAnimations);
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
    //
    // If a custom "enterShowStyle" prop is passed, (i.e. not one that just reverses display: none)
    // we always run it, regardless of the animation, since it's probably doing something around
    // opacity or positioning that Velocity will not necessarily reset.
    if (entering) {
      if (!_.isEqual(this.props.enterShowStyle, {display: ''})
        || !(/^(fade|slide)/.test(animation) || /In$/.test(animation))) {
        style = _.extend({}, this.props.enterShowStyle, style);
      }
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
    var doneFn = function () {
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
      doneFn();
      doneFn = null;
    } else {
      Velocity(nodes, 'stop');
    }

    var combinedCompleteFn;
    if (doneFn && opts.complete) {
      var optsCompleteFn = opts.complete;
      combinedCompleteFn = function () {
        doneFn();
        // preserve this / args from Velocity so the complete function has context for what completed
        optsCompleteFn.apply(this, arguments);
      };
    } else {
      // One or the other or neither.
      combinedCompleteFn = doneFn || opts.complete;
    }

    // Bit of a hack. Without this rAF, sometimes an enter animation doesn't start running, or is
    // stopped before getting anywhere. This should get us on the other side of both completeFn and
    // any _finishAnimation that's happening.
    shimRequestAnimationFrame(function () {
      Velocity(nodes, animation, _.extend({}, opts, {
        complete: combinedCompleteFn,
      }));
    });
  },

  _finishAnimation: function (node, animationProp, overrideOpts) {
    var parsedAnimation = this._parseAnimationProp(animationProp);
    var animation = parsedAnimation.animation;
    var style = parsedAnimation.style;
    var opts = _.extend({}, parsedAnimation.opts, overrideOpts);

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
