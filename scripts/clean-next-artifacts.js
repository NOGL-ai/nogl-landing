#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const targets = [
  path.join(projectRoot, ".next", "types"),
  path.join(projectRoot, ".next-build"),
  path.join(projectRoot, "tsconfig.tsbuildinfo"),
];

for (const target of targets) {
  try {
    fs.rmSync(target, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 150,
    });
  } catch (error) {
    console.warn(`Could not remove ${path.basename(target)}: ${error.message}`);
  }
}
