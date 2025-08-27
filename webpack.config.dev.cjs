const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");

const path = require("path");

module.exports = merge(common, {
  mode: "development",
  devtool: "source-map",
  performance: {
    hints: false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
  },
});
