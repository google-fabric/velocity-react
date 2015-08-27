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
  },

  getDefaultProps: function () {
    return {
      style: {},
      underneath: false,  
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
    }, this.props.style);

    // outer div below absorbs Velocity's display: block behavior, keeping it from overwriting
    // the display: flex
    return (
      <div style={{margin: 10}}>
        <div {...this.props} className="flex-box flex-column justify-content-center align-items-center user-select-none" style={style}>
          {this.props.children}
        </div>
      </div>
    );
  },
})

module.exports = Box;
