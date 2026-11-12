import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    // mongodb-memory-server can take a moment to spin up on first run.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    pool: 'forks',
  },
});
