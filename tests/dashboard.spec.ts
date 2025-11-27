import { test, expect } from '@playwright/test';

test.describe('Overseer Dashboard - Unauthenticated', () => {
  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should show default repositories preview (future feature)', async ({ page }) => {
    // This test is pending implementation of the preview screen
    // TODO: Update when default repos preview is implemented
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Overseer Dashboard - Authenticated', () => {
  // Mock authentication for these tests
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            {
              name: 'next-auth.session-token',
              value: 'mock-session-token',
            },
          ],
        },
      ],
    },
  });

  test('should display dashboard header', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /repositories/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sync repos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add repo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible();
  });

  test('should toggle filters panel', async ({ page }) => {
    await page.goto('/');
    
    const filtersButton = page.getByRole('button', { name: /filters/i });
    await filtersButton.click();
    
    // Filters panel should be visible
    await expect(page.getByText(/all types/i)).toBeVisible();
    await expect(page.getByText(/all languages/i)).toBeVisible();
    await expect(page.getByText(/fork status/i)).toBeVisible();
    
    // Close filters
    await filtersButton.click();
  });

  test('should display repository table with columns', async ({ page }) => {
    await page.goto('/');
    
    // Check table headers
    await expect(page.getByRole('columnheader', { name: /repository/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /type/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /language/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /health/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /activity/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /docs/i })).toBeVisible();
  });

  test('should filter repositories by type', async ({ page }) => {
    await page.goto('/');
    
    // Open filters
    await page.getByRole('button', { name: /filters/i }).click();
    
    // Select a specific type
    const typeSelect = page.locator('select').first();
    await typeSelect.selectOption('web-app');
    
    // Verify filter is applied (repository count should change)
    await expect(page.getByText(/filtered/i)).toBeVisible();
  });

  test('should expand repository details', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Click first repository row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Check for expanded details sections
    await expect(page.getByText(/roadmap/i)).toBeVisible();
    await expect(page.getByText(/tasks/i)).toBeVisible();
    await expect(page.getByText(/documentation/i)).toBeVisible();
  });

  test('should show add repo modal', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /add repo/i }).click();
    
    // Modal should show input fields
    await expect(page.getByPlaceholder(/owner\/repo/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add/i })).toBeVisible();
  });

  test('should validate add repo form', async ({ page }) => {
    await page.goto('/');
    
    // Open add repo modal
    await page.getByRole('button', { name: /add repo/i }).click();
    
    // Try to submit without URL
    const addButton = page.getByRole('button', { name: /^add$/i });
    await addButton.click();
    
    // Form should not submit (input is required)
    await expect(page.getByPlaceholder(/owner\/repo/i)).toBeVisible();
  });

  test('should display health score breakdown on hover', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Hover over first repository's health grade
    const firstHealthGrade = page.locator('tbody tr').first().locator('.text-lg.font-bold');
    await firstHealthGrade.hover();
    
    // Health breakdown popup should appear
    await expect(page.getByText(/health breakdown/i)).toBeVisible();
  });

  test('should sync single repository', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Find and click sync button for a repo
    const syncButton = page.locator('[title*="sync"]').first();
    if (await syncButton.isVisible()) {
      await syncButton.click();
      
      // Should show syncing state
      await expect(page.getByText(/syncing/i)).toBeVisible();
    }
  });

  test('should display health shields', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Expand first repo
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Check for health shields (documentation, testing, best practices, community)
    const healthShields = page.locator('.px-1\\.5.py-0\\.5.rounded.text-\\[10px\\]');
    await expect(healthShields.first()).toBeVisible();
  });

  test('should show AI summary section', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Expand first repo
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Look for AI summary or generate button
    const aiSection = page.getByText(/ai summary/i).or(page.getByText(/generate summary/i));
    await expect(aiSection).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    await page.goto('/');
    
    // Open filters
    await page.getByRole('button', { name: /filters/i }).click();
    
    // Set some filters
    const typeSelect = page.locator('select').first();
    await typeSelect.selectOption('tool');
    
    // Click clear all
    await page.getByRole('button', { name: /clear all/i }).click();
    
    // Filters should reset
    await expect(typeSelect).toHaveValue('all');
  });
});

test.describe('Overseer Dashboard - Documentation Features', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [
            {
              name: 'next-auth.session-token',
              value: 'mock-session-token',
            },
          ],
        },
      ],
    },
  });

  test('should show documentation status icons', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Expand first repo
    await page.locator('tbody tr').first().click();
    
    // Check for doc status icons (ROADMAP, TASKS, METRICS, FEATURES)
    const docSection = page.getByText(/documentation/i).locator('..');
    await expect(docSection).toBeVisible();
  });

  test('should display fix buttons for missing docs', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Look for "Fix all missing docs" button in docs column
    const fixButtons = page.locator('[title*="Fix"]');
    if (await fixButtons.first().isVisible()) {
      await expect(fixButtons.first()).toBeVisible();
    }
  });
});

test.describe('Overseer Dashboard - Performance', () => {
  test('should load page within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle large repository lists', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Should display repository count
    await expect(page.getByText(/repositories?/i)).toBeVisible();
  });
});
