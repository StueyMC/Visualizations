//process.traceDeprecation = true;
const ZipFilesPlugin = require('zip-webpack-plugin');
const common = require("./webpack.common");
const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: false } },
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: false } },
          { loader: 'sass-loader', options: { sourceMap: false } }
        ]
      },
      {
        test: /\.sass$/,
        use: [
          MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: false } },
          { loader: 'sass-loader', options: { sourceMap: false } }
        ]
      }
    ]
  },
  mode: "production",
  optimization: {
    minimizer: [
      new TerserPlugin()
    ]
  },
  resolve: {
    alias: {
      // 'vue$': 'vue/dist/vue.runtime.min.js'
      'vue': '@vue/runtime-dom'
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ZipFilesPlugin({
      path: '..',
      filename: process.env.npm_package_name + '-' + process.env.npm_package_version.replace(/\./g, "-")
    }),
    new MiniCSSExtractPlugin({
      filename: 'css/[name].[fullhash].css',
      chunkFilename: 'css/[id].[fullhash].css'
    })
  ]

});
