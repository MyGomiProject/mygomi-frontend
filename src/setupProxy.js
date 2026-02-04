const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      // pathRewrite는 사용하지 않음 - /api를 그대로 유지
      onProxyReq: (proxyReq, req, res) => {
        console.log('프록시 요청:', req.method, req.url, '->', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('프록시 응답:', req.url, '->', proxyRes.statusCode);
      },
      onError: (err, req, res) => {
        console.error('프록시 에러:', err.message);
      },
    })
  );
};

