import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile iPhone 12', use: { ...devices['iPhone 12'] } },
    { name: 'Tablet iPad', use: { viewport: { width: 768, height: 1024 } } },
  ],
  webServer: {
    command: 'npx ng serve reflect-q-admin --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
