import { expect, test } from '@playwright/test';

// Browser-dependent parity behaviors (layout / positioning / focus) that jsdom
// cannot exercise. Driven against the dedicated /e2e harness route.

test('list opens below the control by default (case 20)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    await control.click();
    const list = page.locator('[data-test="basic"] .svelte-select-list');
    await expect(list).toBeVisible();
    const cBox = await control.boundingBox();
    const lBox = await list.boundingBox();
    expect(lBox.y).toBeGreaterThanOrEqual(cBox.y + cBox.height - 1);
});

test('list matches the control width by default (case 28)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    await control.click();
    const list = page.locator('[data-test="basic"] .svelte-select-list');
    const cBox = await control.boundingBox();
    const lBox = await list.boundingBox();
    expect(Math.abs(lBox.width - cBox.width)).toBeLessThan(2);
});

test('listAutoWidth=false leaves the list width auto (not the control width) (case 112)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="auto-width"] .svelte-select');
    await control.click();
    const list = page.locator('[data-test="auto-width"] .svelte-select-list');
    const widthStyle = await list.evaluate((el) => el.style.width);
    expect(widthStyle).toBe('auto');
});

test('--item-height CSS variable changes item height (case 172)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="item-height"] .svelte-select');
    await control.click();
    const item = page.locator('[data-test="item-height"] .item').first();
    const h = await item.evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeGreaterThan(70);
});

test('focusing a second Select closes the first (case 46, 50, 130, 155)', async ({ page }) => {
    await page.goto('/e2e');
    const first = page.locator('[data-test="first"] .svelte-select');
    await first.click();
    await expect(page.locator('[data-test="first"] .svelte-select-list')).toBeVisible();
    await page.locator('[data-test="second"] .svelte-select').click();
    await expect(page.locator('[data-test="first"] .svelte-select-list')).toHaveCount(0);
});
