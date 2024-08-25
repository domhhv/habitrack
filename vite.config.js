import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dotenv from 'dotenv';
import { visualizer } from 'rollup-plugin-visualizer';

const envPaths = {
  development: './.env.development',
  production: './.env.production',
};

dotenv.config({ path: envPaths[process.env.NODE_ENV] });

export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: true,
      }),
    ],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY),
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
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      historyApiFallback: true,
    },
  };
});