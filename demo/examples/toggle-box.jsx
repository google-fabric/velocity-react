var React = require('react');
var createReactClass = require('create-react-class');
var VelocityComponent = require('../../src/velocity-component');
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

var ToggleBox = createReactClass({
  displayName: 'ToggleBox',

  getInitialState: function() {
    return {
      effect: EFFECTS[0],
      isIn: true,
      counter: 0,
      interruptBehavior: 'stop',
    };
  },

  componentDidMount: function() {
    // Tweening shows how animations work given re-renders
    this.startTweening();
  },

  componentWillUnmount: function() {
    this.stopTweening();
  },

  startTweening: function() {
    this.tweenInterval = setInterval(() => {
      if (this.state.counter === 99) {
        this.setState({ counter: 0 });
      } else {
        this.setState({ counter: this.state.counter + 1 });
      }
    }, 100);
  },

  stopTweening: function() {
    clearInterval(this.tweenInterval);
  },

  whenToggleClicked: function() {
    this.setState({
      isIn: !this.state.isIn,
    });
  },

  whenSelectChanged: function(evt) {
    this.setState({
      effect: evt.target.value,
      isIn: true,
    });
  },

  whenOptionChanged: function(evt) {
    this.setState({ interruptBehavior: evt.target.value });
  },

  render: function() {
    var animation =
      'transition.' + this.state.effect + (this.state.isIn ? 'In' : 'Out');

    return (
      <div className="flex-box flex-column flex-1 align-items-center">
        <div>
          <select value={this.state.effect} onChange={this.whenSelectChanged}>
            {this.renderEffects()}
          </select>
        </div>
        <div className="flex-1">
          <Box
            className="flex-1 flex-box flex-column align-items-center"
            style={{ backgroundColor: '#f5f5f5' }}
            onClick={this.whenToggleClicked}
            instruction="Click!"
          >
            {/*
              Use of key here keeps the component (and its set styles) from persisting across effects.
              Avoids flashing when switching effects.
            */}
            <VelocityComponent
              key={this.state.effect}
              animation={animation}
              interruptBehavior={this.state.interruptBehavior}
            >
              <Box>{this.state.counter}</Box>
            </VelocityComponent>
          </Box>
        </div>
        <div
          style={{
            fontStyle: 'italic',
            fontSize: '11px',
            padding: '0px 30px 10px',
            textAlign: 'center',
          }}
        >
          Number counting to show the [non-]effects of rapid re-rendering on the
          animation.
        </div>
        <div style={{ fontSize: 12 }}>
          <h4
            style={{ marginBottom: 4, fontWeight: 'bold', textAlign: 'center' }}
          >
            Interruption Behavior
          </h4>
          <label>
            <input
              type="radio"
              name="interruptBehavior"
              value="stop"
              checked={this.state.interruptBehavior === 'stop'}
              onChange={this.whenOptionChanged}
            />{' '}
            Stop
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="interruptBehavior"
              value="finish"
              checked={this.state.interruptBehavior === 'finish'}
              onChange={this.whenOptionChanged}
            />{' '}
            Finish
          </label>
          &nbsp;&nbsp;
          <label>
            <input
              type="radio"
              name="interruptBehavior"
              value="queue"
              checked={this.state.interruptBehavior === 'queue'}
              onChange={this.whenOptionChanged}
            />{' '}
            Queue
          </label>
        </div>
      </div>
    );
  },

  renderEffects: function() {
    return EFFECTS.map(function(effect) {
      return (
        <option key={effect} value={effect}>
          {s.titleize(s.humanize(effect))}
        </option>
      );
    });
  },
});

module.exports = ToggleBox;
