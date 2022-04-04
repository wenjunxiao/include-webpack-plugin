const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const IncludeWebpackPlugin = require('../../src')

module.exports = {
  mode: 'development',
  entry: {
    'background': path.resolve(__dirname, './src/background.js'),
    'content': path.resolve(__dirname, './src/content.js'),
    'inject': path.resolve(__dirname, './src/inject.js'),
    'popup': path.resolve(__dirname, './src/popup.js'),
    'onboarding': path.resolve(__dirname, './src/onboarding.js'),
    'options': path.resolve(__dirname, './src/options.js'),
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[chunkhash:8].js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        'css-loader'
      ]
    }, {
      test: /(manifest\.json|help\.tpl)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: IncludeWebpackPlugin.loader,
          options: {
            compress: false,
            decoding: 'UTF-8',
            encoding: 'base64',
            variables: {
              plugin: {
                name: "ChromeTools",
                title: "Chrome Tools"
              }
            }
          }
        }
      ],
    }]
  },
  plugins: [
    new IncludeWebpackPlugin({
      'manifest.json': path.resolve(__dirname, 'src/manifest.json'),
      'help.txt': path.resolve(__dirname, 'src/help.tpl'),
    }, {
      decoding: 'base64',
      encoding: 'UTF-8',
      variable: true
    }),
    new HtmlWebpackPlugin({
      title: 'ChromePopup',
      filename: 'popup.html',
      template: path.resolve(__dirname, './src/popup.html'),
      inject: true,
      chunks: ['popup'],
      // 压缩HTML
      minify: {
        // 移除注释
        removeComments: true,
        // 删除空白符和换行符
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackPlugin({
      title: 'ChromeBoarding',
      filename: 'onboarding.html',
      template: path.resolve(__dirname, './src/onboarding.html'),
      inject: true,
      chunks: ['onboarding'],
      // 压缩HTML
      minify: {
        // 移除注释
        removeComments: true,
        // 删除空白符和换行符
        collapseWhitespace: true
      }
    }),
    new HtmlWebpackPlugin({
      title: 'ChromeOptions',
      filename: 'options.html',
      template: path.resolve(__dirname, './src/options.html'),
      inject: true,
      chunks: ['options'],
      // 压缩HTML
      minify: {
        // 移除注释
        removeComments: true,
        // 删除空白符和换行符
        collapseWhitespace: true
      }
    })
  ]
}