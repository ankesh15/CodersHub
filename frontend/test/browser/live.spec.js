// Opt-in network smoke test. All platform responses come from the real providers.
import { test, expect } from '@playwright/test';
test('real platform statistics, charts, heatmaps, badges and populated PDF render', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const created = await request.post('http://127.0.0.1:5051/api/auth/register', { data: {
    name: 'Live Integration Check', email: 'live@example.test', profile: 'live-integration', password: 'browser-secure-password', github: 'octocat', leetcode: 'leetcode', codeforces: 'tourist',
  } });
  expect(created.status()).toBe(201);
  const responses = await Promise.all([
    ...['github', 'leetcode', 'codeforces'].map(platform => page.waitForResponse(response => response.url().endsWith(`/api/${platform}`), { timeout: 90000 })),
    page.goto('/result/live-integration'),
  ]);
  for (const response of responses.slice(0, 3)) expect(response.status(), response.url()).toBe(200);
  const [github, leetcode, codeforces] = await Promise.all(responses.slice(0, 3).map(response => response.json()));
  const stats = page.locator('.profile-stats h3');
  await expect(stats.nth(0)).toHaveText(String(github.profile.public_repos));
  await expect(stats.nth(1)).toHaveText(String(leetcode.profile.totalSolved));
  await expect(stats.nth(2)).toHaveText(String(codeforces.profile.rating));
  await expect(page.getByText('Century Solver', { exact: true })).toBeVisible();
  await expect(page.getByText('Active CP Competitor', { exact: true })).toBeVisible();
  await expect(page.locator('.react-calendar-heatmap').first()).toBeVisible();
  await expect(page.locator('.recharts-line-curve[stroke="#f43f5e"]')).toBeVisible();
  // Recharts animates SVG paths on mount; allow the actual chart animation to finish.
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results-live/live-profile.png', fullPage: true });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: 'test-results-live/live-profile.pdf', format: 'A4', printBackground: true });
  await page.emulateMedia({ media: 'screen' });
  await page.goto('/login');
  await page.locator('input[type="text"]').fill('live-integration');
  await page.locator('input[type="password"]').fill('browser-secure-password');
  const dashboardResponses = await Promise.all([
    ...['github', 'leetcode', 'codeforces'].map(platform => page.waitForResponse(response => response.url().endsWith(`/api/${platform}`), { timeout: 90000 })),
    page.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);
  for (const response of dashboardResponses.slice(0, 3)) expect(response.status(), response.url()).toBe(200);
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('.recharts-pie')).toBeVisible();
  await expect(page.getByText('Polyglot Coder', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results-live/live-dashboard.png', fullPage: true });
  expect(errors).toEqual([]);
});
