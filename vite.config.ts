import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import * as path from 'path';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  plugins: [react(), basicSsl(), EnvironmentPlugin({ API_ROOT: '' })],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7042',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
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
});
