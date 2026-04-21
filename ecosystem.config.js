/**
 * PM2 ecosystem for CT 504 (nogl-dev) — web app only.
 * Background workers have moved to CT 505 (nogl-workers) as Docker containers.
 * See docker-compose.workers.yml for worker configuration.
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
  ],
};
