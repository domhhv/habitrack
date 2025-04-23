/// <reference types="vitest/config" />
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { loadEnv, defineConfig, type UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const env = loadEnv(mode, process.cwd(), '');

  return {
    clearScreen: false,
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

            if (id.includes('date-fns')) {
              return 'date-fns';
            }

            if (id.includes('@react-aria')) {
              return 'react-aria';
            }

            if (id.includes('@react-stately')) {
              return 'react-stately';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return 'index';
          },
        },
      },
    },
    define: {
      SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY),
      SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
    },
    plugins: [
      react(),
      isProduction &&
        visualizer({
          filename: 'dist/stats.html',
        }),
    ],
    resolve: {
      alias: {
        '@components': resolve(__dirname, './src/components'),
        '@const': resolve(__dirname, './src/const'),
        '@db-types': resolve(__dirname, './supabase/database.types'),
        '@helpers': resolve(__dirname, './src/helpers'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@models': resolve(__dirname, './src/models'),
        '@pages': resolve(__dirname, './src/pages'),
        '@root': resolve(__dirname, './'),
        '@services': resolve(__dirname, './src/services'),
        '@stores': resolve(__dirname, './src/stores'),
        '@tests': resolve(__dirname, './tests'),
        '@utils': resolve(__dirname, './src/utils'),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      coverage: {
        reportsDirectory: './tests/coverage',
      },
    },
  } satisfies UserConfig;
});
