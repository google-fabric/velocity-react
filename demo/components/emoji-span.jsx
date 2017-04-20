var React = require('react');
var PropTypes = require('prop-types');
var createReactClass = require('create-react-class');
var twemoji = require('twemoji');
var s = require('underscore.string');

// Component that uses the Twitter twemoji library to turn emoji-rich strings into spans with
// <img> tags in them (for cross-browser/os compatibility).
var EmojiSpan = createReactClass({
  displayName: 'Emoji',

  propTypes: {
    size: PropTypes.number,
    children: PropTypes.string,
  },

  getDefaultProps: function () {
    return {
      size: 36,
    };
  },

  render: function () {
    let {children, size, ...attrs} = this.props;

    return (
      <span {...attrs} dangerouslySetInnerHTML={{__html: twemoji.parse(s.escapeHTML(children), {size: size})}} />
    );
  },
});

module.exports = EmojiSpan;
