import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:18080',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (_error, _request, response) => {
              if (!response.headersSent) {
                response.writeHead(503, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'C++ scheduler is not running at http://localhost:18080.' }));
              }
            });
          },
        },
      },
    },
  };
});
