// Component for a VelocityTransitionGroup that crossfades between its children.
//
// To use this component, render with a single child that contains the "loading" version of your
// UI. When data has loaded, switch the "key" of this child so that React considers it a brand
// new element and triggers the enter / leave effects. The two versions of the UI are expected to
// have identical heights.
//
// Properties on this component (such as "style") are applied to the VelocityTransitionGroup
// component that this delegates to. We set the VelocityTransitionGroup's container to a <div> by
// default, and provide enter and leave animations, though these could be overridden if it makes
// sense for your use case. A postion: 'relative' style is also applied by default since the loading
// effect requires position: 'absolute' on the child.
//
// This component defines a "duration" property that is used for both the enter and leave animation
// durations.
//
// Use the property "opaque" if the children have opaque backgrounds. This will make the new element
// come in 100% opacity and fade the old element out from on top of it. (Without this, opaque
// elements end up bleeding the background behind the LoadingCrossfadeComponent through.)

var React = require('react');
var _ = require('lodash');
var VelocityTransitionGroup = require('../../velocity-transition-group');

var LoadingCrossfadeComponent = React.createClass({
  displayName: 'LoadingCrossfadeComponent',

  propTypes: {
    opaque: React.PropTypes.bool,
    duration: React.PropTypes.number,
    // At most 1 child should be supplied at a time, though the animation does correctly handle
    // elements moving in and out faster than the duration (so you can have 2 leaving elements
    // simultaneously, for example).
    children: React.PropTypes.element,
  },

  getDefaultProps: function () {
    return {
      duration: 350,
    };
  },

  render: function () {
    // We pull style out explicitly so that we can merge the position: 'relative' over any provided
    // value. position: 'relative' lets us absolutely-position the leaving child during the fade.
    var style = _.defaults((this.props.style || {}), { position: 'relative' });

    var transitionGroupProps = _.defaults(_.omit(this.props, _.keys(this.constructor.propTypes), 'style'), {
      component: 'div',
      style: style,

      enter: {
        animation: { opacity: 1 },
        duration: this.props.duration,
        style: {
          // If we're animating opaque backgrounds then we just render the new element under the
          // old one and fade out the old one. Without this, at e.g. the crossfade midpoint of
          // 50% opacity for old and 50% opacity for new, the parent background ends up bleeding
          // through 25%, which makes things look not smooth at all.
          opacity: this.props.opaque ? 1 : 0,

          // We need to clear out all the styles that "leave" puts on the element.
          position: 'relative',
          top: '',
          left: '',
          bottom: '',
          right: '',
          zIndex: '',
        },
      },

      leave: {
        animation: { opacity: 0 },
        duration: this.props.duration,
        style: {
          // 'absolute' so the 2 elements overlap for a crossfade
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 1,
        },
      },
    });

    return React.createElement(VelocityTransitionGroup, transitionGroupProps, this.props.children);
  },
});

module.exports = LoadingCrossfadeComponent;
