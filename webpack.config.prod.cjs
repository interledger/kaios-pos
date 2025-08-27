const merge = require("webpack-merge");
const cssnano = require("cssnano");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const common = require("./webpack.common.cjs");

const uglifyOptions = {
  ecma: 8,
  beautify: false,
  comments: false,
  compress: {
    collapse_vars: true,
    reduce_vars: true,
    drop_console: true,
  },
  mangle: {
    reserved: ["$super", "$", "exports", "require"],
  },
};

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      uglifyOptions,
    }),
    new OptimizeCssAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: {
        preset: "default",
        safe: true,
        discardComments: {
          removeAll: true,
        },
      },
    }),
  ],
});
