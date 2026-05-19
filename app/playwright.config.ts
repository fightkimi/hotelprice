import { defineConfig, devices } from '@playwright/test';

process.env.NO_PROXY = '127.0.0.1,localhost';
process.env.no_proxy = '127.0.0.1,localhost';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:42317',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: '/opt/homebrew/bin/npm run dev -- --port 42317 --strictPort',
    url: 'http://127.0.0.1:42317',
    reuseExistingServer: false
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
});
