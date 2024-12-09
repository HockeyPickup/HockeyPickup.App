import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [react(), basicSsl()],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  define: {
    __API_URL__: JSON.stringify(
      mode === 'production' ? 'https://api.hockeypickup.com/api' : '/api',
    ),
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7042',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options): void => {
          proxy.on('error', (err, _req, _res) => {
            console.info('Proxy Error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.info('Proxy Send:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.info('Proxy Receive:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
}));
