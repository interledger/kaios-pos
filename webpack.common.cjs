const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
!fs.existsSync("./release") && fs.mkdirSync("./release");

module.exports = {
  name: "common",

  target: "web",

  entry: {
    app: "./src/main.tsx",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css", ".json"],
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "@": resolveApp("./src/"),
      "@routes": resolveApp("./src/routes/"),
      "@components": resolveApp("./src/components/"),
      "@pages": resolveApp("./src/pages/"),
      "@state": resolveApp("./src/state/"),
      "@lib": resolveApp("./src/lib/"),
      "@services": resolveApp("./src/services/"),
      "@constants": resolveApp("./src/constants/"),
      "@hooks": resolveApp("./src/hooks/"),
      "@config": resolveApp("./src/config/index.ts"),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/].*\.js$/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
        },
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader",
        options: { limit: 100000 },
      },
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
    ],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV || "development",
    }),
    new CleanWebpackPlugin({ verbose: false }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.webapp.json", to: "manifest.webapp" },
        { from: "assets", to: "assets" },
        { from: "src/locales", to: "locales" },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new ZipPlugin({
      path: path.resolve(__dirname, "release"),
      filename: "application.zip",
    }),
  ],
};
