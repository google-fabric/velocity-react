var _ = require('lodash');
var React = require('react');
var VelocityTransitionGroup = require('../../src/velocity-transition-group');
var velocityHelpers = require('../../src/velocity-helpers');

var Box = require('../components/box');
var EmojiSpan = require('../components/emoji-span');

var CATS = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '😿', '🙀'];
var FOODS = [
  '🍅',
  '🍆',
  '🍇',
  '🍈',
  '🍉',
  '🍊',
  '🍌',
  '🍍',
  '🍎',
  '🍏',
  '🍑',
  '🍒',
  '🍓',
  '🍔',
  '🍕',
  '🍖',
  '🍗',
];

var Animations = {
  // Register these with UI Pack so that we can use stagger later.
  In: velocityHelpers.registerEffect({
    calls: [
      [
        {
          transformPerspective: [800, 800],
          transformOriginX: ['50%', '50%'],
          transformOriginY: ['100%', '100%'],
          marginBottom: 0,
          opacity: 1,
          rotateX: [0, 130],
        },
        1,
        {
          easing: 'ease-out',
          display: 'block',
        },
      ],
    ],
  }),

  Out: velocityHelpers.registerEffect({
    calls: [
      [
        {
          transformPerspective: [800, 800],
          transformOriginX: ['50%', '50%'],
          transformOriginY: ['0%', '0%'],
          marginBottom: -30,
          opacity: 0,
          rotateX: -70,
        },
        1,
        {
          easing: 'ease-out',
          display: 'block',
        },
      ],
    ],
  }),
};

const newItem = i => {
  return {
    title: [_.sample(CATS)].concat(_.sample(FOODS, _.random(1, 4))).join(' '),
    i,
  };
};

class ScrollingGroup extends React.Component {
  state = {
    itemCount: 1,
    items: [newItem(0)],
    duration: 500,
  };

  whenAddButtonClicked = () => {
    this.addRows(1);
  };

  whenAdd5ButtonClicked = () => {
    this.addRows(5);
  };

  whenOptionClicked = event => {
    this.setState({ duration: parseInt(event.target.value) });
  };

  addRows = count => {
    var items = this.state.items;

    for (var i = 0; i < count; ++i) {
      var item = newItem(i + this.state.itemCount);
      items = [item].concat(items);
    }

    this.setState({
      items: items.slice(0, 6),
      itemCount: this.state.itemCount + count,
    });
  };

  render() {
    var rows = this.state.items.map(function(item, i, arr) {
      var itemStyle = {
        width: 150,
        padding: '0 10px',
        lineHeight: '30px',
        backgroundColor:
          item.i % 2 == 0 ? Box.COLORS.backColor : Box.COLORS.underneathColor,
      };

      return (
        <div key={item.i} style={itemStyle}>
          <EmojiSpan>{item.title}</EmojiSpan>
        </div>
      );
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

        <VelocityTransitionGroup
          component="div"
          className="flex-1"
          style={groupStyle}
          enter={enterAnimation}
          leave={leaveAnimation}
        >
          {rows}
        </VelocityTransitionGroup>

        <form style={{ fontSize: 12 }}>
          <label>
            <input
              type="radio"
              name="speed"
              value={500}
              checked={this.state.duration === 500}
              onChange={this.whenOptionClicked}
            />{' '}
            Fast
          </label>
          &nbsp;
          <label>
            <input
              type="radio"
              name="speed"
              value={2000}
              checked={this.state.duration === 2000}
              onChange={this.whenOptionClicked}
            />{' '}
            Slow
          </label>
        </form>
      </div>
    );
  }
}

module.exports = ScrollingGroup;
