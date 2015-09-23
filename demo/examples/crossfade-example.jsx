var _ = require('lodash');

var React = require('react');
var VelocityComponent = require('../../lib/velocity-component');
var VelocityTransitionGroup = require('../../lib/velocity-transition-group');
var VelocityHelpers = require('../../lib/velocity-helpers');

var Box = require('../components/box');
var EmojiSpan = require('../components/emoji-span');
var LoadingCrossfadeComponent = require('../components/loading-crossfade-component');

require('../css/loading-placeholder.css');

var LOCATION_COUNT = 4;

var BUILDINGS = ['🏠', '🏡', '🏢', '🏬', '🏭', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '💒', '⛪', '🏪', '🏫'];
var CAPTIALS = ['Montgomery', 'Juneau', 'Phoenix', 'Little Rock', 'Sacramento', 'Denver', 'Hartford', 'Dover',
  'Tallahassee', 'Atlanta', 'Honolulu', 'Boise', 'Springfield', 'Indianapolis', 'Des Moines', 'Topeka', 'Frankfort',
  'Baton Rouge', 'Augusta', 'Annapolis', 'Boston', 'Lansing', 'St. Paul', 'Jackson', 'Jefferson City', 'Helena',
  'Lincoln', 'Carson City', 'Concord', 'Trenton', 'Santa Fe', 'Albany', 'Raleigh', 'Bismarck', 'Columbus',
  'Oklahoma City', 'Salem', 'Harrisburg', 'Providence', 'Columbia', 'Pierre', 'Nashville', 'Austin', 'Salt Lake City',
  'Montpelier', 'Richmond', 'Olympia', 'Charleston', 'Madison', 'Cheyenne'];

var CrossfadeExample = React.createClass({
  displayName: 'CrossfadeExample',

  getInitialState: function () {
    return {
      expanded: false,
      items: null,
      duration: 500,
    };
  },

  componentWillUnmount: function () {
    window.clearTimeout(this.locationTimeout);
  },

  whenToggleClicked: function () {
    if (this.state.expanded) {
      this.setState({
        expanded: false,
        items: null,
      });

      window.clearTimeout(this.locationTimeout);
    } else {
      this.setState({
        expanded: true,
        items: null,
      });

      this.locationTimeout = window.setTimeout(this.loadLocations, this.state.duration * 1.5);
    }
  },

  loadLocations: function () {
    this.setState({
      items: Array.apply(null, Array(LOCATION_COUNT)).map(function () {
        return {
          building: _.sample(BUILDINGS),
          city: _.sample(CAPTIALS),
        };
      }),
    });
  },

  whenOptionClicked: function (event) {
    this.setState({ duration: parseInt(event.target.value) });
  },

  render: function () {
    var groupStyle = {
      width: 198,
    };

    var boxStyle = {
      margin: '-10px 0 0 0',
    };

    var toggleStyle = {
      width: 200,
      backgroundColor: '#3f83b7',
      color: 'white',
      padding: 8,
      fontSize: 13,
      lineHeight: '18px',
      cursor: 'pointer',
    };

    var arrowStyle = {
      display: 'block',
      fontSize: 18,
    };

    return (
      <div className="flex-box flex-1 flex-column align-items-center" style={boxStyle}>
        <div className="flex-box justify-content-space-between" style={toggleStyle} onClick={this.whenToggleClicked}>
          Points of Interest
          <VelocityComponent animation={{rotateZ: this.state.expanded ? 0 : -180}} duration={this.state.duration}>
            <EmojiSpan style={arrowStyle}>👇</EmojiSpan>
          </VelocityComponent>
        </div>

        <VelocityTransitionGroup component="div" className="flex-1" style={groupStyle}
          enter={{animation: 'slideDown', duration: this.state.duration}}
          leave={{animation: 'slideUp', duration: this.state.duration}}>
          {this.state.expanded ? this.renderLocations() : null}
        </VelocityTransitionGroup>

        <form style={{fontSize: 12}}>
          <label>
            <input type="radio" name="speed" value={500} checked={this.state.duration === 500} onChange={this.whenOptionClicked}/> Fast
          </label>
          &nbsp;
          <label>
            <input type="radio" name="speed" value={2000} checked={this.state.duration === 2000} onChange={this.whenOptionClicked}/> Slow
          </label>
        </form>
      </div>
    );
  },

  renderLocations: function () {
    var boxStyle = {
      backgroundColor: '#fefefe',
      padding: '5px 10px',
    };

    var locations = this.state.items != null ? this.state.items : Array.apply(null, Array(LOCATION_COUNT));

    return (
      <LoadingCrossfadeComponent duration={this.state.duration * .75}>
        <div key={this.state.items != null ? 'locations' : 'loading'} style={boxStyle}>{locations.map(this.renderLocation)}</div>
      </LoadingCrossfadeComponent>
    );
  },

  renderLocation: function(location, i) {
    location = location || {building: '', city: ''};

    var emojiStyle = {
      fontSize: 30,
      display: 'block',
      width: 34.5,
      height: 31,
    };

    var rowStyle = {
      padding: '5px 0',
    };

    var cityStyle = {
      fontSize: 16,
      margin: '0 0 0 5px',
    };

    return (
      <div className="flex-box align-items-center" style={rowStyle}>
        <EmojiSpan key={i}
          className={location.city == '' ? 'loading-placeholder-dark loading-placeholder-full' : ''}
          style={emojiStyle}>{location.building}</EmojiSpan>
        <div style={cityStyle} className={'flex-1 ' + (location.city == '' ? 'loading-placeholder-dark loading-placeholder-full' : '')}>
          {location.city}
        </div>
      </div>
    );
  }
});

module.exports = CrossfadeExample;
