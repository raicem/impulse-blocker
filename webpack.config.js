const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    background: './extension/background.js',
    popup: './extension/popup/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'extension/dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/env',
                {
                  targets: {
                    firefox: '60',
                  },
                  useBuiltIns: 'usage',
                },
              ],
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '../../dist',
            },
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
  plugins: [new CleanWebpackPlugin(['dist'])],
};
