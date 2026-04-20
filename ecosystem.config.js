/**
 * PM2 ecosystem for CT 504 (nogl-dev).
 *
 * Adds BullMQ workers alongside the Next.js server. Each worker runs its
 * own process so a crash in one does not take down the HTTP server.
 *
 * Notes:
 *   - kill_timeout: 30s lets the BullMQ worker drain an in-flight 500-event
 *     transaction before PM2 SIGKILLs. Default PM2 10s was too short.
 *   - Workers are TypeScript; we run them via tsx to avoid a separate build
 *     step. Swap to compiled dist output if cold-start becomes an issue.
 */
module.exports = {
  apps: [
    {
      name: "next",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      kill_timeout: 10_000,
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
  ],
};
