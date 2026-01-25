#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';
const pwd = isWindows ? process.cwd() : '$(pwd)';

const args = process.argv.slice(2);
const command = `docker run --rm -v "${pwd}:/sql" sqlfluff/sqlfluff ${args.join(' ')}`;

try {
  execSync(command, {
    shell: true,
    stdio: 'inherit',
  });
} catch (error) {
  process.exit(error.status || 1);
}
