import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

const envPaths = {
  development: './.env.development',
  production: './.env.production',
};

dotenv.config({ path: envPaths[process.env.NODE_ENV] });

export default defineConfig(({ _command, mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      isProduction &&
        visualizer({
          filename: 'dist/stats.html',
          open: true,
        }),
    ],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(
        process.env.SUPABASE_ANON_KEY
      ),
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

            if (id.includes('@mui')) {
              return 'material-ui';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            if (id.includes('nextui')) {
              return 'next-ui';
            }

            if (id.includes('node_modules')) {
              return 'vendor';
            }

            return 'index';
          },
        },
      },
    },
    server: {
      historyApiFallback: true,
    },
  };
});
