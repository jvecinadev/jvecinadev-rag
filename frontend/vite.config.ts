import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'https://jvecinadev-rag.onrender.com';

  return {
    plugins: [react(), tailwindcss()],
    base: command === 'build' ? (env.VITE_BASE_PATH || '/app/') : '/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      outDir: '../public/app',
      emptyOutDir: true,
    },
  };
});