var React = require('react');
var VelocityTransitionGroup = require('../../lib/velocity-transition-group');
var VelocityHelpers = require('../../lib/velocity-helpers');

var Box = require('../components/box');
var EmojiSpan = require('../components/emoji-span');

var CATS = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '😿', '🙀'];
var FOODS = ['🍅', '🍆', '🍇', '🍈', '🍉', '🍊', '🍌', '🍍', '🍎', '🍏', '🍑', '🍒', '🍓', '🍔', '🍕', '🍖', '🍗'];


var Animations = {
  // Register these with UI Pack so that we can use stagger later.
  In: VelocityHelpers.registerEffect({
    calls: [
      [{
        transformPerspective: [ 800, 800 ],
        transformOriginX: [ '50%', '50%' ],
        transformOriginY: [ '100%', '100%' ],
        marginBottom: 0,
        opacity: 1,
        rotateX: [0, 130],
      }, 1, {
        easing: 'ease-out',
        display: 'block',
      }]
    ],
  }),

  Out: VelocityHelpers.registerEffect({
    calls: [
      [{
        transformPerspective: [ 800, 800 ],
        transformOriginX: [ '50%', '50%' ],
        transformOriginY: [ '0%', '0%' ],
        marginBottom: -30,
        opacity: 0,
        rotateX: -70,
      }, 1, {
        easing: 'ease-out',
        display: 'block',
      }]
    ],
  }),
};

var ScrollingGroup = React.createClass({
  displayName: 'ScrollingGroup',

  getInitialState: function () {
    return {
      itemCount: 0,
      items: [],
      duration: 500,
    };
  },

  componentWillMount: function () {
    this.whenAddButtonClicked();
  },

  whenAddButtonClicked: function () {
    this.addRows(1);
  },

  whenAdd5ButtonClicked: function () {
    this.addRows(5);
  },

  whenOptionClicked: function (event) {
    this.setState({ duration: parseInt(event.target.value) });
  },

  addRows: function (count) {
    var items = this.state.items;

    for (var i = 0; i < count; ++i) {
      var item = {
        title: [_.sample(CATS)].concat(_.sample(FOODS, _.random(1, 4))).join(' '),
        i: this.state.itemCount + i,
      };

      items = [item].concat(items);
    }

    this.setState({
      items: items.slice(0, 6),
      itemCount: this.state.itemCount + count,
    });
  },

  render: function () {
    var rows = this.state.items.map(function (item, i, arr) {
      var itemStyle = {
        width: 150,
        padding: '0 10px',
        lineHeight: '30px',
        backgroundColor: (item.i % 2 == 0) ? Box.COLORS.backColor : Box.COLORS.underneathColor,
      };

      return (<div key={item.i} style={itemStyle}><EmojiSpan>{item.title}</EmojiSpan></div>);
    });

    var groupStyle = {
      margin: '10px 0',
    };

    var enterAnimation = {
      animation: Animations.In,
      stagger: this.state.duration,
      duration: this.state.duration,
      backwards: true,
      display: 'block',
      style: {
        // Since we're staggering, we want to keep the display at "none" until Velocity runs
        // the display attribute at the start of the animation.
        display: 'none',
      },
    };

    var leaveAnimation = {
      animation: Animations.Out,
      stagger: this.state.duration,
      duration: this.state.duration,
      backwards: true,
    };

    return (
      <div className="flex-box flex-1 flex-column align-items-center">
        <div>
          <button onClick={this.whenAddButtonClicked}>Add Row</button>
          <button onClick={this.whenAdd5ButtonClicked}>Add 5 Rows</button>
        </div>

        <VelocityTransitionGroup component="div" className="flex-1" style={groupStyle} enter={enterAnimation} leave={leaveAnimation}>
          {rows}
        </VelocityTransitionGroup>

        <div style={{fontSize: 12}}>
          <label>
            <input type="radio" name="speed" value={500} checked={this.state.duration === 500} onChange={this.whenOptionClicked}/> Fast
          </label>
          &nbsp;
          <label>
            <input type="radio" name="speed" value={2000} checked={this.state.duration === 2000} onChange={this.whenOptionClicked}/> Slow
          </label>
        </div>
      </div>
    );
  },
});

module.exports = ScrollingGroup;
