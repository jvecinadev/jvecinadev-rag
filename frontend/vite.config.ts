import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'https://jvecinadev-rag.onrender.com';

  // On Vercel (or when VITE_BASE_PATH=/), build at root '/' into 'dist'.
  // Otherwise, build for Laravel's '/app/' subdirectory into '../public/app'.
  const isRootBuild = Boolean(process.env.VERCEL || env.VITE_BASE_PATH === '/');
  const basePath =
    command === 'build'
      ? env.VITE_BASE_PATH || (isRootBuild ? '/' : '/app/')
      : '/';

  return {
    plugins: [react(), tailwindcss()],
    base: basePath,
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
      outDir: isRootBuild ? 'dist' : '../public/app',
      emptyOutDir: true,
    },
  };
});
