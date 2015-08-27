var React = require('react');
var VelocityComponent = require('../../lib/velocity-component');
var s = require('underscore.string');

var Box = require('../components/box');
var EmojiSpan = require('../components/emoji-span');

var PALS = ['👫', '👬', '👭'];

var EFFECTS = [
  'bounce',
  'shake',
  'flash',
  'pulse',
  'swing',
  'tada',
];

var TriggerBox = React.createClass({
  displayName: 'TriggerBox',

  getInitialState: function () {
    return {
      effect: EFFECTS[0],
      chain: 'stop',
      palIndex: 0,
    };
  },

  whenClicked: function () {
    this.setState({
      palIndex: (this.state.palIndex + 1) % PALS.length,
    });

    var opts = {
      finish: this.state.chain === 'finish',
      stop: this.state.chain === 'stop',
    };

    this.refs.velocity.runAnimation(opts);
  },

  whenSelectChanged: function (evt) {
    this.setState({
      effect: evt.target.value,
      isIn: true,
    });
  },

  whenOptionChanged: function (evt) {
    this.setState({ chain: evt.target.value });
  },

  render: function () {
    var boxStyle = {
      margin: 10,
      height: 130,
      width: 130,
      padding: '30px 0 0 0',
      backgroundColor: '#3f83b7',
      fontWeight: 600,
      fontSize: 60,
      textAlign: 'center',
    };

    var animation = 'callout.' + this.state.effect;

    return (
      <div className="flex-box flex-column flex-1 align-items-center">
        <div>
          <select rvalue={this.state.effect} onChange={this.whenSelectChanged}>{this.renderEffects()}</select>
        </div>
        <div className="flex-1">
          {/*
            Use of key here keeps the component (and its set styles) from persisting across effects.
            Avoids flashing when switching effects.
          */}
          <VelocityComponent ref="velocity" key={this.state.effect} animation={animation}>
            <Box onClick={this.whenClicked}>
              <EmojiSpan size={72}>{PALS[this.state.palIndex]}</EmojiSpan>
            </Box>
          </VelocityComponent>
        </div>
        <div style={{ fontSize: 12 }}>
          <label>
            <input type="radio" name="chain" value="stop" checked={this.state.chain === 'stop'} onChange={this.whenOptionChanged}/> Stop
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="chain" value="finish" checked={this.state.chain === 'finish'} onChange={this.whenOptionChanged}/> Finish
          </label>
          &nbsp;&nbsp;
          <label>
            <input type="radio" name="chain" value="queue" checked={this.state.chain === 'queue'} onChange={this.whenOptionChanged}/> Queue
          </label>
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

module.exports = TriggerBox;
