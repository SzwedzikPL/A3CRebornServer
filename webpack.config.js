const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");
const package = require('./package.json');

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
  plugins: [
    new webpack.DefinePlugin({
      PACKAGE_VERSION: JSON.stringify(package.version),
    }),
    new CopyPlugin({
      patterns: [
        path.resolve(__dirname, "src", "server.ini"),
      ],
    })
  ],
  resolve: {
    plugins: [
      new DirectoryNamedWebpackPlugin({
        honorIndex: true,
        include: [
          path.resolve(__dirname, "src"),
        ]
      })
    ],
    alias: {
      '@': path.resolve(__dirname, "src")
    },
    extensions: ['.js', '.json', '.node']
  },
};
