require('./css/flexbox.css');

var React = require('react');

require('velocity-animate');
require('velocity-animate/velocity.ui');

var CrossfadeExample = require('./examples/crossfade-example');
var FlapBox = require('./examples/flap-box');
var ScrollingGroup = require('./examples/scrolling-group');
var ToggleBox = require('./examples/toggle-box');
var TriggerBox = require('./examples/trigger-box');

class Demo extends React.Component {
  render() {
    var boxStyle = {
      backgroundColor: '#efefef',
      margin: 10,
      padding: '0 0 10px 0',
      width: 200,
      height: 300,
    };

    var headingStyle = {
      margin: '10px 0',
      padding: '0 0 10px 0',
      width: '100%',
      textAlign: 'center',
      fontWeight: 200,
      fontSize: 14,
      borderBottom: '1px solid #e5e5e5',
    };

    return (
      <div className="flex-box flex-column align-items-center" style={boxStyle}>
        <h3 style={headingStyle}>{this.props.title}</h3>
        {this.props.children}
      </div>
    );
  }
}

class MainComponent extends React.Component {
  render() {
    return (
      <div className="flex-box flex-wrap">
        <Demo title="Property Change">
          <ToggleBox />
        </Demo>
        <Demo title="On Demand">
          <TriggerBox />
        </Demo>
        <Demo title="Custom Animation">
          <FlapBox />
        </Demo>
        <Demo title="Custom Transition Group">
          <ScrollingGroup />
        </Demo>
        <Demo title="Crossfade">
          <CrossfadeExample />
        </Demo>
      </div>
    );
  }
}

module.exports = MainComponent;
