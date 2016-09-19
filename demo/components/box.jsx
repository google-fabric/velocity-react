var _ = require('lodash');
var React = require('react');

require('../css/polyfill.css');

var Box = React.createClass({
  displayName: 'Box',

  statics: {
    COLORS: {
      frontColor: '#3f83b7',
      backColor: '#5797c0',
      underneathColor: '#255175',
    },
  },

  propTypes: {
    style: React.PropTypes.object,
    underneath: React.PropTypes.bool,
    instruction: React.PropTypes.string,
  },

  getDefaultProps: function () {
    return {
      style: {},
      underneath: false,
      instruction: '',
    };
  },

  render: function() {
    var style = _.extend({}, {
      height: 130,
      width: 130,
      backgroundColor: this.constructor.COLORS[this.props.underneath ? 'underneathColor' : 'frontColor'],
      textAlign: 'center',
      fontSize: 80,
      fontWeight: 'bold',
      cursor: 'pointer',
      position: this.props.underneath ? '' : 'relative',
    }, this.props.style);

    var instructionStyle = {
      position: 'absolute',
      bottom: 3,
      left: 0,
      right: 0,
      fontSize: '11px',
      fontWeight: 'normal',
      textTransform: 'uppercase',
      color: '#eee',
      opacity: 0.4,
    };

    // Pass any props that are not our own on through.
    var restProps = _.omit(this.props, _.keys(this.constructor.propTypes));

    // outer div below absorbs Velocity's display: block behavior, keeping it from overwriting
    // the display: flex
    return (
      <div style={{margin: 10}}>
        <div {...restProps} className="flex-box flex-column justify-content-center align-items-center user-select-none" style={style}>
          {this.props.children}
          {this.props.instruction ? <div style={instructionStyle}>{this.props.instruction}</div> : null}
        </div>
      </div>
    );
  },
});

module.exports = Box;
