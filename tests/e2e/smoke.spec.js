import { expect, test } from '@playwright/test';

test('demo loads and renders the examples nav', async ({ page }) => {
    await page.goto('/examples');
    await expect(page.getByRole('heading', { name: 'Props', exact: true })).toBeVisible();
});
