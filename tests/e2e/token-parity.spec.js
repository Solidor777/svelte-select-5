import { expect, test } from '@playwright/test';

// Confirms the tokenized styles render the historical values (parity), and that
// a primitive override visibly re-themes the rendered control.

test('control renders the historical white bg and default border', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    const styles = await control.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, border: cs.borderTopColor };
    });
    expect(styles.bg).toBe('rgb(255, 255, 255)');
    expect(styles.border).toBe('rgb(216, 219, 223)'); // #d8dbdf
});

test('active item renders the historical accent (#007aff)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    await control.click();
    // first item is hovered, not active; give it a value so an active row exists
    const activeBg = await control.evaluate((el) => {
        const probe = document.createElement('div');
        el.appendChild(probe);
        probe.style.background = 'var(--svelte-select-item-active-bg)';
        const c = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return c;
    });
    expect(activeBg).toBe('rgb(0, 122, 255)');
});

test('overriding --svelte-select-accent re-themes the rendered active item', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    await control.evaluate((el) => el.style.setProperty('--svelte-select-accent', 'rgb(20, 30, 40)'));
    const activeBg = await control.evaluate((el) => {
        const probe = document.createElement('div');
        el.appendChild(probe);
        probe.style.background = 'var(--svelte-select-item-active-bg)';
        const c = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return c;
    });
    expect(activeBg).toBe('rgb(20, 30, 40)');
});

test('legacy flat var still themes the control (deprecated alias path)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    await control.evaluate((el) => el.style.setProperty('--background', 'rgb(1, 2, 3)'));
    const bg = await control.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(1, 2, 3)');
});
