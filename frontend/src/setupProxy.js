const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: '', // Change this to the port your backend server is running on
      changeOrigin: true,
    })
  );
};
