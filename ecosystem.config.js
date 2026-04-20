/**
 * PM2 ecosystem for CT 504 (nogl-dev).
 */
module.exports = {
  apps: [
    {
      name: "next",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/root/nogl-landing",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      kill_timeout: 10_000,
      env: { NODE_ENV: "production", NEXT_DIST_DIR: ".next-build" },
    },
    {
      name: "worker:ingest",
      script: "node_modules/.bin/tsx",
      args: "--env-file .env src/lib/queues/workers/ingest.worker.ts",
      cwd: "/root/nogl-landing",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      kill_timeout: 30_000,
      autorestart: true,
      env: { NODE_ENV: "production" },
    },
    {
      name: "worker:meta-ads",
      script: "node_modules/.bin/tsx",
      args: "--env-file .env scripts/run-meta-ads-worker.ts",
      cwd: "/root/nogl-landing",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      kill_timeout: 60_000,
      autorestart: true,
      max_restarts: 5,
      env: { NODE_ENV: "production" },
    },
  ],
};
