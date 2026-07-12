import react from '@vitejs/plugin-react';
import { loadEnv, defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    clearScreen: false,
    plugins: [react()],
    build: {
      emptyOutDir: true,
      outDir: 'dist-ssr',
      sourcemap: false,
      ssr: 'src/landing/entry-server.tsx',
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
  };
});
