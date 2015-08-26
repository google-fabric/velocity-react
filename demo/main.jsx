var React = require('react');
var VelocityComponent = require('../lib/velocity-component');

require('velocity-animate/velocity.ui');

var MainComponent = React.createClass({
  getInitialState: function () {
    return {
      fadeInOut: 'transition.bounceIn',
    };
  },

  whenFadeInOutClicked: function () {
    this.setState({
      fadeInOut: (this.state.fadeInOut === 'transition.bounceIn') ? 'transition.bounceOut' : 'transition.bounceIn',
    });
  },

  render: function () {
    return React.DOM.div({}, this.renderFadeInOut());
  },

  renderFadeInOut: function () {
    var holderStyle = {
      width: 130,
      lineHeight: 2,
      textAlign: 'center',
    };

    var boxStyle = {
      height: 130,
      backgroundColor: '#6e8fcf',
    };

    return (
      <div style={holderStyle}>
        <a href="javascript:void(0)" onClick={this.whenFadeInOutClicked}>Click to Toggle</a>
        <VelocityComponent animation={this.state.fadeInOut}>
          <div style={boxStyle}></div>
        </VelocityComponent>
      </div>
    );

  },
});

module.exports = MainComponent;