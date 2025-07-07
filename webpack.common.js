const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, './src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './src/index.html'),
    }),
    new CopyWebpackPlugin({ // <-- Tambahkan konfigurasi ini
      patterns: [
        {
          from: path.resolve(__dirname, './src/public/'), // Salin semua dari public/
          to: path.resolve(__dirname, 'dist/public/'),
        },
        {
          from: path.resolve(__dirname, './src/sw.js'), // <-- Salin sw.js dari src/ ke dist/
          to: path.resolve(__dirname, 'dist/sw.js'),
        },
       {
          from: path.resolve(__dirname, './src/manifest.json'), // <-- Salin manifest.json
          to: path.resolve(__dirname, 'dist/manifest.json'),
        },
         {
          from: path.resolve(__dirname, './src/styles/'),
          to: path.resolve(__dirname, 'dist/styles/'),
        },
      ],
    }),
  ],
};