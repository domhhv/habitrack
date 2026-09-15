/// <reference types="vitest/config" />
import { resolve } from 'path';

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import webpackStatsPlugin from 'rollup-plugin-webpack-stats';
import { loadEnv, defineConfig, type UserConfig } from 'vite';
import viteRollbar from 'vite-plugin-rollbar-sourcemap';

export default defineConfig(({ isSsrBuild, mode }) => {
  const isProduction = mode === 'production';

  const env = loadEnv(mode, process.cwd(), '');

  const ROLLBAR_CONFIG = {
    accessToken: env.ROLLBAR_SERVER_ACCESS_TOKEN,
    baseUrl: env.VERCEL_URL ? `https://${env.VERCEL_URL}` : env.BASE_URL,
    ignoreUploadErrors: true,
    silent: true,
    version: env.VERCEL_GIT_COMMIT_SHA || '0.1.0',
  };

  return {
    clearScreen: false,
    build: {
      sourcemap: true,
      rollupOptions: isSsrBuild
        ? undefined
        : {
            onwarn(warning, warn) {
              if (
                warning.message.includes('Module "os" has been externalized')
              ) {
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

                if (id.includes('heroui')) {
                  return 'heroui';
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
      VERCEL_GIT_COMMIT_SHA: JSON.stringify(env.VERCEL_GIT_COMMIT_SHA),
      ROLLBAR_CLIENT_ACCESS_TOKEN: JSON.stringify(
        env.ROLLBAR_CLIENT_ACCESS_TOKEN
      ),
    },
    plugins: [
      [!process.env.VITEST && reactRouter()],
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
        '@components': resolve(import.meta.dirname, './src/components'),
        '@const': resolve(import.meta.dirname, './src/constants'),
        '@db-types': resolve(import.meta.dirname, './supabase/database.types'),
        '@helpers': resolve(import.meta.dirname, './src/helpers'),
        '@hooks': resolve(import.meta.dirname, './src/hooks'),
        '@models': resolve(import.meta.dirname, './src/models'),
        '@pages': resolve(import.meta.dirname, './src/pages'),
        '@services': resolve(import.meta.dirname, './src/services'),
        '@stores': resolve(import.meta.dirname, './src/stores'),
        '@tests': resolve(import.meta.dirname, './tests'),
        '@utils': resolve(import.meta.dirname, './src/utils'),
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
