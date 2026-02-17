/// <reference types="vitest/config" />
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import { loadEnv, defineConfig, type UserConfig } from 'vite';
import viteRollbar from 'vite-plugin-rollbar-sourcemap';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  const env = loadEnv(mode, process.cwd(), '');

  const ROLLBAR_CONFIG = {
    accessToken: env.ROLLBAR_SERVER_ACCESS_TOKEN,
    baseUrl: env.VERCEL_URL ? `https://${env.VERCEL_URL}` : env.BASE_URL,
    ignoreUploadErrors: true,
    silent: true,
    version: '1.0.0',
  };

  return {
    clearScreen: false,
    build: {
      sourcemap: true,
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

            if (id.includes('@internationalized')) {
              return 'internationalized';
            }

            if (id.includes('@react-aria')) {
              return 'react-aria';
            }

            if (id.includes('@react-stately')) {
              return 'react-stately';
            }

            if (id.includes('react-router')) {
              return 'react-router';
            }

            if (id.includes('heroui/theme')) {
              return 'heroui-theme';
            }

            if (id.includes('heroui')) {
              return 'heroui';
            }

            if (id.includes('framer-motion') || id.includes('motion-dom')) {
              return 'framer-motion';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }
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
      react(),
      tailwindcss(),
      viteRollbar(ROLLBAR_CONFIG),
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
