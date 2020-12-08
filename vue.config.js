// optional config options for vue-cli
// vue.config.js

let devServerProxyData = {
  // see https://github.com/axios/axios/issues/853
  '/api/pskreporter': {
    target: 'https://retrieve.pskreporter.info/query/',
    pathRewrite: { '^/api/pskreporter': '' },
    changeOrigin: true,
    secure: false
  }
}

module.exports = {
  // relative root, so dist files can be served locally
  publicPath: './',

  // webpack-dev-server configuration
  devServer: {
    host: '0.0.0.0',
    port: 8088,
    https: false,
    hotOnly: false,
    proxy: devServerProxyData
  },
  "transpileDependencies": [
    "vuetify"
  ]
}

// FixMe: can enable CORS on github pages
//    https://stackoverflow.com/questions/18923328/is-there-a-way-to-enable-cors-on-github-pages
