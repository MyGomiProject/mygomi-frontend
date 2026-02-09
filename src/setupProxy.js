const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
   '/api',
    createProxyMiddleware( {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      
      // "경로를 재작성(Rewrite)할 건데, 규칙이 없다(빈 객체)" = "경로 수정 안 함"
      pathRewrite: {},

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

