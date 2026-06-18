import { expect, test } from '@playwright/test';

// Token resolution must be verified in a real browser; jsdom does not resolve
// custom properties. getComputedStyle returns custom props unsubstituted, so we
// resolve the var() chain through a real property on a probe element.

const resolveColor = (locator, tokenName, overrides = {}) =>
    locator.evaluate(
        (el, { token, ov }) => {
            for (const [k, v] of Object.entries(ov)) el.style.setProperty(k, v);
            const probe = document.createElement('div');
            el.appendChild(probe);
            probe.style.color = `var(${token})`;
            const resolved = getComputedStyle(probe).color;
            probe.remove();
            return resolved;
        },
        { token: tokenName, ov: overrides }
    );

test('control-bg semantic token resolves to the white primitive default', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    expect(await resolveColor(control, '--svelte-select-control-bg')).toBe('rgb(255, 255, 255)');
});

test('item-active-bg resolves to the accent primitive default (#007aff)', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    expect(await resolveColor(control, '--svelte-select-item-active-bg')).toBe('rgb(0, 122, 255)');
});

test('overriding the accent primitive cascades through the semantic token', async ({ page }) => {
    await page.goto('/e2e');
    const control = page.locator('[data-test="basic"] .svelte-select');
    const resolved = await resolveColor(control, '--svelte-select-item-active-bg', {
        '--svelte-select-accent': 'rgb(10, 20, 30)',
    });
    expect(resolved).toBe('rgb(10, 20, 30)');
});
