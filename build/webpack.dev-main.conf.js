var webpack = require('webpack')
var merge = require('webpack-merge')
var baseConfig = require('./webpack.base.conf')
var cssLoaders = require('./css-loaders')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var config = require('../config')

baseConfig.entry = {
  app: './app/main.js'
}

// add hot-reload related code to entry chunks
Object.keys(baseConfig.entry).forEach(function (name) {
  baseConfig.entry[name] = ['./build/dev-client'].concat(baseConfig.entry[name])
})

var devServerUrl = 'http://localhost:' + config.dev.port + '/'

var webpackConfig = merge(baseConfig, {
  // eval-source-map is faster for development
  devtool: '#eval-source-map',
  output: {
    // necessary for the html plugin to work properly
    // when serving the html from in-memory
    // need to explicitly set localhost to prevent
    // the hot updates from looking for local files
    publicPath: devServerUrl
  },
  vue: {
    loaders: cssLoaders({
      sourceMap: false,
      extract: false
    })
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'main.html',
      template: './app/main.html',
      excludeChunks: ['devtools'],
      inject: true
    })
  ]
})

if (config.dev.vueDevTools) {
  webpackConfig.entry.app.unshift(
    './tools/vue-devtools/hook.js',
    './tools/vue-devtools/backend.js'
  )
  webpackConfig.entry.devtools = './tools/vue-devtools/devtools.js'

  webpackConfig.plugins.push(new HtmlWebpackPlugin({
    filename: 'devtools.html',
    template: './tools/vue-devtools/index.html',
    chunks: ['devtools'],
    inject: true
  }))
}



module.exports = webpackConfig
