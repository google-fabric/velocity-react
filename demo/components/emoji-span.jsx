var React = require('react');
var twemoji = require('twemoji');
var s = require('underscore.string');

// Component that uses the Twitter twemoji library to turn emoji-rich strings into spans with
// <img> tags in them (for cross-browser/os compatibility).
var EmojiSpan = React.createClass({
  displayName: 'Emoji',

  propTypes: {
    size: React.PropTypes.number,
    children: React.PropTypes.string,
  },

  getDefaultProps: function () {
    return {
      size: 36,
    };
  },

  render: function () {
    return (
      <span dangerouslySetInnerHTML={{__html: twemoji.parse(s.escapeHTML(this.props.children), {size: this.props.size})}} />
    );
  },
});

module.exports = EmojiSpan;
