module.exports = {
      // 彻底关闭 ESLint
  chainWebpack: config => {
    config.module.rules.delete('eslint');
  },
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://142.171.229.172:5000',
        changeOrigin: true
      }
  }
}
}