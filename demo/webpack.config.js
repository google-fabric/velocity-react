var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './app.js',
  devtool: 'eval',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['react-hot', 'babel']
      },
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['react-hot']
      }
    ]
  },
  plugins: [
  ], 
};
