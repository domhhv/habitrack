/// <reference types="vitest/config" />
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import { loadEnv, defineConfig, type UserConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const env = loadEnv(mode, process.cwd(), '');

  return {
    clearScreen: false,
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.message.includes('Module "os" has been externalized')) {
            return;
          }

          warn(warning);
        },
        output: {
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          manualChunks(id) {
            if (id.includes('@supabase')) {
              return 'supabase';
            }

            if (id.includes('@phosphor-icons')) {
              return 'phosphor-icons';
            }

            if (id.includes('heroui')) {
              return 'heroui';
            }

            if (id.includes('motion')) {
              return 'framer-motion';
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
      ROLLBAR_CLIENT_ENV: JSON.stringify(env.ROLLBAR_CLIENT_ENV),
      SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY),
      SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
      ROLLBAR_CLIENT_ACCESS_TOKEN: JSON.stringify(
        env.ROLLBAR_CLIENT_ACCESS_TOKEN
      ),
    },
    plugins: [
      tailwindcss(),
      react(),
      ...(isProduction
        ? [
            webpackStatsPlugin(),
            visualizer({
              filename: 'dist/stats.html',
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@components': resolve(__dirname, './src/components'),
        '@const': resolve(__dirname, './src/constants'),
        '@db-types': resolve(__dirname, './supabase/database.types'),
        '@helpers': resolve(__dirname, './src/helpers'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@models': resolve(__dirname, './src/models'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@stores': resolve(__dirname, './src/stores'),
        '@tests': resolve(__dirname, './tests'),
        '@utils': resolve(__dirname, './src/utils'),
        '@supabase/supabase-js': resolve(
          __dirname,
          './node_modules/@supabase/supabase-js/dist/index.cjs'
        ),
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
