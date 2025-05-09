/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
import path from 'path';

export default {
  '*.{md,js,ts,tsx}': ['yarn eslint:check', 'yarn prettier:check'],
  '*.{ts,tsx}': () => {
    return 'yarn typecheck';
  },
  'supabase/**/*.sql': (filenames) => {
    const cwd = process.cwd();

    const normalizedDockerPaths = filenames.map((filename) => {
      // Get relative path and normalize to forward slashes for Docker
      return path.relative(cwd, filename).replace(/\\/g, '/');
    });

    return [`yarn lint:sql ${normalizedDockerPaths.join(' ')}`];
  },
};
