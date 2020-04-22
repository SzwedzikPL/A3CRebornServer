const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    server: path.join(__dirname, 'src', 'server.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [],
};
