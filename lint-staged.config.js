/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{md,js,ts,tsx}': ['yarn eslint:check', 'yarn prettier:check'],
  '*.{ts,tsx}': () => {
    return 'yarn typecheck';
  },
  'supabase/**/*.sql': (filenames) => {
    const cwd = process.cwd();

    const normalizedDockerPaths = filenames.map((filename) => {
      return filename.replace(`${cwd}/`, '');
    });

    return [`yarn lint:sql ${normalizedDockerPaths.join(' ')}`];
  },
};
