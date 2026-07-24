import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: './src',
  ssr: true,
  async prerender() {
    return ['/'];
  },
} satisfies Config;
