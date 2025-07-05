const { merge } = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: common.output.path,
    },
    client: {
      overlay: true,
    },
    compress: true,
    hot: true,
    port: 9000,
  },
});