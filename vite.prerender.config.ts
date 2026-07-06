import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: 'dist-ssr',
    sourcemap: false,
    ssr: 'src/landing/entry-server.tsx',
  },
});
