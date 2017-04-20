var React = require('react');
var createReactClass = require('create-react-class');
var VelocityComponent = require('../../velocity-component');
var velocityHelpers = require('../../velocity-helpers');

var Box = require('../components/box');
var EmojiSpan = require('../components/emoji-span');

/*

This demo shows how to use custom Velocity UI pack effects to achieve an animation based
on a state value.

*/

var FlipAnimations = {
  // Brings the box from flipped up to down. Also the default state that the box starts in. When
  // this animates, includes a little swing at the end so it feels more like a flap.
  down: velocityHelpers.registerEffect({
    // longer due to spring timing
    defaultDuration: 1100,
    calls: [
      [{
        transformPerspective: [ 800, 800 ],
        transformOriginX: [ '50%', '50%' ],
        transformOriginY: [ 0, 0 ],
        rotateX: [0, 'spring'],
        // We step this back immediately; you don't notice and it means we're not fading in as
        // the spring swings rotateX back and forth.
        backgroundColor: [Box.COLORS.frontColor, Box.COLORS.frontColor],
      }, 1, {
        delay: 100,
        easing: 'ease-in',
      }]
    ],
  }),

  // Flips the box up nearly 180°.
  up: velocityHelpers.registerEffect({
    defaultDuration: 200,
    calls: [
      [{
        transformPerspective: [ 800, 800 ],
        transformOriginX: [ '50%', '50%' ],
        transformOriginY: [ 0, 0 ],
        rotateX: 160,
        backgroundColor: Box.COLORS.backColor,
      }]
    ],
  }),
};

// Animations to blur the number within the box for when it's flipped up.
//
// Blur animations each have a delay to make them change roughly when the flip is halfway up,
// to capture the transition from front to back (and vice versa). They flip over their values
// immediately with no tweening, since that doesn't make sense for the effect. We're using
// Velocity here only to co-ordinate the timing of the change.
var BlurAnimations = {
  blur: velocityHelpers.registerEffect({
    defaultDuration: 200,
    calls: [
      [{ blur: [3, 3], opacity: [.4, .4] }, 1, { delay: 50 }],
    ],
  }),

  unblur: velocityHelpers.registerEffect({
    defaultDuration: 200,
    calls: [
      [{ blur: [0, 0], opacity: [1, 1] }, 1, { delay: 150 }],
    ],
  })
};

var FlapBox = createReactClass({
  displayName: 'FlapBox',

  getInitialState: function () {
    return {
      hovering: false,
    };
  },

  whenMouseEntered: function () {
    this.setState({ hovering: true });
  },

  whenMouseLeft: function () {
    this.setState({ hovering: false });
  },

  render: function () {
    var containerStyle = {
      // Neded since the "top" is absolutely positioned
      position: 'relative',
      cursor: 'default',
    };

    return (
      <div className="flex-box flex-column align-items-center">
        <div>
          <button style={{ visibility: 'hidden' }}>&nbsp;</button>
        </div>

        <div style={containerStyle}
             onMouseEnter={this.whenMouseEntered}
             onMouseLeave={this.whenMouseLeft}>
          {this.renderTop()}
          {this.renderUnderneath()}
        </div>
      </div>
    );
  },

  renderTop: function () {
    var flipAnimation;
    var contentsAnimation;

    if (this.state.hovering) {
      flipAnimation = FlipAnimations.up;
      contentsAnimation = BlurAnimations.blur;
    } else {
      flipAnimation = FlipAnimations.down;
      contentsAnimation = BlurAnimations.unblur;
    }

    var boxStyle = {
      position: 'absolute',
    };

    return (
      <VelocityComponent animation={flipAnimation}>
        <Box style={boxStyle} instruction="Hover!">
          <VelocityComponent animation={contentsAnimation}>
            <EmojiSpan size={72}>🙈</EmojiSpan>
          </VelocityComponent>
        </Box>
      </VelocityComponent>
    );
  },

  renderUnderneath: function() {
    return (<Box underneath={true}><EmojiSpan size={72}>🐵</EmojiSpan></Box>);
  },
});

module.exports = FlapBox;
