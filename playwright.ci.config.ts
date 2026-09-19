import { defineConfig, devices } from '@playwright/test';

/**
 * DB-free e2e config used by CI (.github/workflows/e2e.yml) and runnable
 * locally without any secrets or database:
 *
 *   npx playwright test -c playwright.ci.config.ts
 *
 * Only runs e2e/mocked/**, where every /api call is mocked. The full
 * live-API suite (e2e/dashboard.spec.ts, playwright.config.ts) needs a real
 * database and is run locally.
 */
const PORT = 3000;
const AUTH_ENV = {
  GITHUB_ID: 'e2e-dummy-id',
  GITHUB_SECRET: 'e2e-dummy-secret',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'e2e-dummy-nextauth-secret',
  NEXTAUTH_URL: `http://localhost:${PORT}`,
  AUTH_TRUST_HOST: 'true',
};

// The spec mints session cookies with the same secret the server uses.
process.env.NEXTAUTH_SECRET = AUTH_ENV.NEXTAUTH_SECRET;

export default defineConfig({
  testDir: './e2e/mocked',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // `next dev` (NODE_ENV=development) keeps the session cookie name
    // unprefixed (authjs.session-token), which the spec relies on.
    command: 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: AUTH_ENV,
  },
});
