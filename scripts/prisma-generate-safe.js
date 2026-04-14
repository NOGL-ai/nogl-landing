#!/usr/bin/env node

/**
 * Safe Prisma Generate Wrapper
 * Handles timeouts and database unavailability gracefully
 * Prevents build failures when database is unreachable
 */

const { spawn } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname, '..'));

console.log('🔧 Running Prisma generate...');

const timeout = 30000; // 30 second timeout
let timedOut = false;
const prismaCommand = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma'
);

const prisma =
  process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', `"${prismaCommand}" generate`], {
        stdio: 'inherit',
        env: { ...process.env }
      })
    : spawn(prismaCommand, ['generate'], {
        stdio: 'inherit',
        env: { ...process.env }
      });

const timeoutHandle = setTimeout(() => {
  timedOut = true;
  console.warn(
    '\n⚠️  Prisma generate timeout (>30s) - database may be unreachable'
  );
  console.log('Continuing with cached client...');
  prisma.kill();
  process.exit(0);
}, timeout);

prisma.on('exit', (code) => {
  clearTimeout(timeoutHandle);

  if (timedOut) {
    process.exit(0);
  }

  if (code === 0) {
    console.log('✅ Prisma generate completed');
    process.exit(0);
  } else {
    console.warn('⚠️  Prisma generate exited with code', code);
    // Don't fail the build - continue with cached client
    process.exit(0);
  }
});

prisma.on('error', (err) => {
  clearTimeout(timeoutHandle);
  console.warn('⚠️  Prisma generate error:', err.message);
  // Don't fail the build - continue with cached client
  process.exit(0);
});
