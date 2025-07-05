import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  webServer: {
    command: 'pnpm db:reset:test && pnpm start:test',
    url: 'http://localhost:3000',
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
});
