import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const env = loadEnv(mode, process.cwd(), '');

  return {
    clearScreen: false,
    plugins: [
      react(),
      isProduction &&
        visualizer({
          filename: 'dist/stats.html',
        }),
    ],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@services': resolve(__dirname, './src/services'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@context': resolve(__dirname, './src/context'),
        '@utils': resolve(__dirname, './src/utils'),
        '@helpers': resolve(__dirname, './src/helpers'),
        '@models': resolve(__dirname, './src/models'),
        '@tests': resolve(__dirname, './tests'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            if (id.includes('nextui')) {
              return 'nextui';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return 'index';
          },
        },
      },
    },
  } satisfies UserConfig;
});
