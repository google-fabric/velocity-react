var React = require('react');
var VelocityComponent = require('../../velocity-component');
var tweenState = require('react-tween-state');
var s = require('underscore.string');

var Box = require('../components/box');

var EFFECTS = [
  'fade',
  'flipX',
  'flipY',
  'flipBounceX',
  'flipBounceY',
  'swoop',
  'whirl',
  'shrink',
  'expand',
  'bounce',
  'bounceUp',
  'bounceDown',
  'bounceLeft',
  'bounceRight',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'slideUpBig',
  'slideDownBig',
  'slideLeftBig',
  'slideRightBig',
  'perspectiveUp',
  'perspectiveDown',
  'perspectiveLeft',
  'perspectiveRight',
];

var ToggleBox = React.createClass({
  displayName: 'ToggleBox',

  mixins: [ tweenState.Mixin ],

  getInitialState: function () {
    return {
      effect: EFFECTS[0],
      isIn: true,
      counter: 0,
    };
  },

  componentWillMount: function () {
    // Tweening shows how animations work given re-renders
    this.startTweening();
  },

  startTweening: function () {
    this.tweenState('counter', {
      duration: 5000,
      endValue: 100,
      onEnd: this.reverseTweening,
    });
  },

  reverseTweening: function () {
    this.tweenState('counter', {
      duration: 5000,
      endValue: 0,
      onEnd: this.startTweening,
    });
  },

  whenToggleClicked: function () {
    this.setState({
      isIn: !this.state.isIn,
    });
  },

  whenSelectChanged: function (evt) {
    this.setState({
      effect: evt.target.value,
      isIn: true,
    });
  },

  render: function () {
    var animation = 'transition.' + this.state.effect + (this.state.isIn ? 'In' : 'Out')

    return (
      <div className="flex-box flex-column flex-1 align-items-center">
        <div>
          <select rvalue={this.state.effect} onChange={this.whenSelectChanged}>{this.renderEffects()}</select>
        </div>
        <Box className="flex-1 flex-box flex-column align-items-center" style={{backgroundColor:'#f5f5f5'}} onClick={this.whenToggleClicked} instruction="Click!">
          {/*
            Use of key here keeps the component (and its set styles) from persisting across effects.
            Avoids flashing when switching effects.
          */}
          <VelocityComponent key={this.state.effect} animation={animation}>
            <Box>{Math.floor(this.getTweeningValue('counter'))}</Box>
          </VelocityComponent>
        </Box>
        <div style={{ fontStyle: 'italic', fontSize: '11px', padding: '0px 30px', textAlign: 'center' }}>
          Number counting to show the [non-]effects of rapid re-rendering on the animation.
        </div>
      </div>
    );
  },

  renderEffects: function () {
    return EFFECTS.map(function (effect) {
      return (<option key={effect} value={effect}>{s.titleize(s.humanize(effect))}</option>);
    });
  },
});

module.exports = ToggleBox;
