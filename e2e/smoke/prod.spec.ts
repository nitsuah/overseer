/**
 * Post-deploy smoke test, run against the LIVE site (SMOKE_URL) after every
 * merge to main (.github/workflows/smoke.yml). Signed-out only, so it needs no
 * credentials: it checks that the deployed dashboard renders real repo rows
 * and that expanding one doesn't take the page down -- the failure that went
 * unnoticed in production for weeks because nothing exercised the deploy.
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 } });

test('the deployed dashboard lists repo rows', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
  expect(await page.locator('table tbody tr').count()).toBeGreaterThan(0);
});

test('expanding a live repo row shows its details without crashing the page', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  const row = page.locator('table tbody tr').first();
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.locator('td').nth(1).click();

  await expect(page.getByRole('heading', { name: 'Repository Stats' })).toBeVisible({ timeout: 30000 });
  await expect(page.locator('table')).toBeVisible();
  await expect(page.getByText(/this page couldn.t load/i)).toHaveCount(0);
  await expect(page.getByText(/couldn.t render details/i)).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('the public API serves default repos as real JSON numbers', async ({ request }) => {
  const res = await request.get('/api/repos');
  expect(res.status()).toBe(200);
  const repos = (await res.json()) as Array<Record<string, unknown>>;
  expect(Array.isArray(repos)).toBe(true);
  expect(repos.length).toBeGreaterThan(0);
  for (const repo of repos) {
    for (const column of ['token_density', 'comment_to_code_ratio', 'commit_frequency', 'avg_pr_merge_time_hours', 'coverage_score']) {
      if (repo[column] !== null && repo[column] !== undefined) {
        expect(typeof repo[column], `${String(repo.name)}.${column}`).toBe('number');
      }
    }
  }
});
