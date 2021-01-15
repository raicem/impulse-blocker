const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  entry: {
    background: "./src/background.js",
    popup: "./src/popup/index.js",
    options: "./src/options/index.js",
  },
  output: {
    path: path.resolve(__dirname, "extension/dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: "../../dist",
            },
          },
        ],
      },
    ],
  },
  devtool: "source-map",
  plugins: [new CleanWebpackPlugin(["dist"])],
};
