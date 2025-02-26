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
      SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
      SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@services': resolve(__dirname, './src/services'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@helpers': resolve(__dirname, './src/helpers'),
        '@models': resolve(__dirname, './src/models'),
        '@stores': resolve(__dirname, './src/stores'),
        '@tests': resolve(__dirname, './tests'),
        '@root': resolve(__dirname, './'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }

            if (id.includes('heroui')) {
              return 'heroui';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            if (id.includes('@react-aria')) {
              return 'react-aria';
            }

            if (id.includes('@react-stately')) {
              return 'react-stately';
            }

            if (id.includes('react-dom')) {
              return 'react-dom';
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
