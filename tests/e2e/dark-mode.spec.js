import { expect, test } from '@playwright/test';

test('data-theme="dark" re-themes the control surface and text (case dark)', async ({ page }) => {
    await page.goto('/e2e');
    const light = page.locator('[data-test="basic"] .svelte-select');
    const dark = page.locator('[data-test="dark"] .svelte-select');

    const lightBg = await light.evaluate((el) => getComputedStyle(el).backgroundColor);
    const darkBg = await dark.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(lightBg).toBe('rgb(255, 255, 255)');
    expect(darkBg).toBe('rgb(38, 38, 46)'); // #26262e
    expect(darkBg).not.toBe(lightBg);
});

test('dark theme cascades to the list background', async ({ page }) => {
    await page.goto('/e2e');
    const dark = page.locator('[data-test="dark"] .svelte-select');
    await dark.click();
    const listBg = await page
        .locator('[data-test="dark"] .svelte-select-list')
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(listBg).toBe('rgb(38, 38, 46)');
});
