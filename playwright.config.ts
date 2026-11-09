import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    // SauceDemo marks elements with data-test, not Playwright's default data-testid.
    testIdAttribute: 'data-test',
    // Fail a click/fill after 10s instead of using the whole 30s test timeout.
    actionTimeout: 10_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 1) Runs first. Only picks up *.setup.ts files (tests/auth.setup.ts),
    //    which logs in through the UI and saves the session to a JSON file.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // 2) The browser projects wait for "setup" (dependencies), then every
    //    new browser context starts with the saved cookies + localStorage
    //    (storageState), so tests begin already logged in.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/standard_user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/standard_user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/standard_user.json' },
      dependencies: ['setup'],
    },
  ],
});
