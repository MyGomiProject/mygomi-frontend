const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // 1. Express가 '/api'로 시작하는 요청을 잡습니다.
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      
      // [핵심] app.use가 떼어낸 '/api'를 다시 붙여서 백엔드에 보냅니다.
      pathRewrite: {
        '^/': '/api/'
      },

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

