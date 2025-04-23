#!/usr/bin/env node

import { spawn } from 'child_process';
import { platform } from 'os';

const isWindows = platform() === 'win32';
const executable = isWindows ? 'supabase.exe' : 'supabase';
const args = process.argv.slice(2);

const supabaseProcess = spawn(executable, args, {
  shell: true,
  stdio: 'inherit',
});

supabaseProcess.on('close', (code) => {
  process.exit(code);
});

supabaseProcess.on('error', (err) => {
  console.error(`Failed to run Supabase CLI: ${err.message}`);
  process.exit(1);
});
