#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Start the build watcher
console.log('Starting build watcher...');
const buildWatcher = spawn('npm', ['run', 'start:watch'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// Wait a bit for initial build to complete
setTimeout(() => {
  console.log('\nStarting SSR dev server...');
  const ssrServer = spawn('npm', ['run', 'start:ssr'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    buildWatcher.kill();
    ssrServer.kill();
    process.exit();
  });

  process.on('SIGTERM', () => {
    buildWatcher.kill();
    ssrServer.kill();
    process.exit();
  });

  ssrServer.on('exit', (code) => {
    buildWatcher.kill();
    process.exit(code);
  });
}, 3000);

buildWatcher.on('exit', (code) => {
  if (code !== 0) {
    console.error('Build watcher failed');
    process.exit(code);
  }
});