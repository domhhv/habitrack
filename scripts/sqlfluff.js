#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';
const pwd = isWindows ? '%cd%' : '$(pwd)';

const args = process.argv.slice(2);
const command = `docker run --rm -v ${pwd}:/sql sqlfluff/sqlfluff ${args.join(' ')}`;

const shell = isWindows ? 'cmd.exe' : 'sh';
const shellArgs = isWindows ? ['/c', command] : ['-c', command];

const child = spawn(shell, shellArgs, {
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code);
});
