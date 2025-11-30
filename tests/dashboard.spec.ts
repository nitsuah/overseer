import { test, expect } from '@playwright/test';

test.describe('Overseer Dashboard - Unauthenticated', () => {
  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');

    // Should stay on dashboard
    await expect(page).toHaveURL('/');

    // Should show the repositories heading
    await expect(page.getByRole('heading', { name: /repositories/i })).toBeVisible();
  });

  test('should show sign in button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should show sign in button
    await expect(page.getByRole('button', { name: /sign in to manage repositories/i })).toBeVisible();
  });

  test('should show repository count', async ({ page }) => {
    await page.goto('/');

    // Should show repository count (even if 0)
    await expect(page.getByText(/repositories?/i)).toBeVisible();
  });
});

// NOTE: Authenticated tests require a real GitHub OAuth flow or mocking NextAuth v5's server-side session
// which is complex. For now, we're testing the unauthenticated state.
// TODO: Set up proper E2E authentication testing with a test GitHub account

test.describe('Overseer Dashboard - Performance', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should display page title', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Overseer/);
  });
});
