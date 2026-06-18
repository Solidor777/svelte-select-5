# Svelte 5 + Runes + Layered CSS Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `svelte-select` from a single Svelte 3 component into an idiomatic, decomposed Svelte 5 runes library with a layered, fully-customizable CSS token system.

**Architecture:** A slim `Select.svelte` coordinator orchestrates rune-based logic modules (`selection.svelte.js`, `filtering.svelte.js`) and child components (`List`, `Item`, `SingleSelection`, `MultiSelection`, icons). The public API moves from `createEventDispatcher` events to callback props and from named slots to snippets. Styling moves to a three-tier CSS custom-property system (primitives → semantic tokens → deprecation aliases). Work proceeds in four phases: toolchain up, runes rewrite at behavioral parity (CSS untouched), layered tokens, docs.

**Tech Stack:** Svelte 5, `@sveltejs/kit` 2, Vite 5+, `@sveltejs/package` 2, `@floating-ui/dom`, Vitest + `@testing-library/svelte`, Playwright, TypeScript 5.

## Global Constraints

- Target framework floor: `svelte@^5.0.0`. The component must be in runes mode (no `export let`, `$:`, `<slot>`, `on:`, `createEventDispatcher`).
- New CSS tokens are namespaced `--svelte-select-*`. Every pre-existing flat variable (the ~115 in `docs/theming_variables.md`) must continue to resolve, mapped onto a new semantic token, and be documented as deprecated.
- Phase 2 must reach **behavioral parity** with the current component: every behavior covered by the existing 189 cases in `test/src/tests.js` must have an equivalent passing test before Phase 3 begins.
- Package build still emits to `package/` via `svelte-package`. Public entry stays `src/lib/index.js`.
- No new component *features* beyond Svelte 3 parity (token system excepted).
- Commit after every task. Never force-push, reset --hard, or drop history (project CLAUDE.md).
- Source of truth for parity translation is the current `src/lib/Select.svelte`; read the exact current behavior there rather than guessing.

---

## File Structure

**Created:**
- `src/lib/selection.svelte.js` — value/selection state + coercion (rune module).
- `src/lib/filtering.svelte.js` — filter + group + loadOptions orchestration (absorbs `filter.js`, `get-items.js`).
- `src/lib/List.svelte` — list rendering, hover/active, empty, virtual list, floating position.
- `src/lib/Item.svelte` — single item render + default item content.
- `src/lib/SingleSelection.svelte` — single-value display in the control.
- `src/lib/MultiSelection.svelte` — multi-value chips display in the control.
- `src/lib/floating.svelte.js` — thin `@floating-ui/dom` action wrapper (only if `svelte-floating-ui` lacks a Svelte 5 build; see Task 1).
- `src/lib/styles/tokens.css` — Tier 1 + Tier 2 token definitions.
- `src/lib/styles/aliases.css` — Tier 3 deprecation aliases.
- `vitest.config.js`, `vitest-setup.js`, `playwright.config.js`.
- `tests/unit/*.test.js`, `tests/component/*.test.js`, `tests/e2e/*.spec.js`.

**Modified:**
- `src/lib/Select.svelte` — full rewrite to runes coordinator.
- `src/lib/ChevronIcon.svelte`, `ClearIcon.svelte`, `LoadingIcon.svelte` — runes `$props()`.
- `package.json` — deps, scripts, exports.
- `svelte.config.js`, `vite.config.js`.
- `docs/generate_theming_variables_md.cjs` — emit tiered list.
- `README.md`, `MIGRATION_GUIDE.md`, `src/routes/examples/**`.

**Deleted:**
- `rollup.config.js`, `test/` (legacy harness — replaced by `tests/`), `src/lib/filter.js`, `src/lib/get-items.js` (absorbed), `tailwind.config.cjs` if unused after audit.

---

## PHASE 1 — Toolchain

### Task 1: Upgrade core dependencies and framework configs

**Files:**
- Modify: `package.json`
- Modify: `svelte.config.js`
- Modify: `vite.config.js`
- Delete: `rollup.config.js`

**Interfaces:**
- Produces: a project that installs cleanly on Svelte 5 and runs `npm run dev` with the existing component still compiling in legacy mode (it has not been rewritten yet — Svelte 5 runs Svelte 3 syntax in legacy mode, so the dev server must still boot).

- [ ] **Step 1: Check `svelte-floating-ui` Svelte 5 support**

Run: `npm view svelte-floating-ui peerDependencies`
Decision: if its `svelte` peer allows `^5`, keep it and skip `src/lib/floating.svelte.js`. If it does NOT, plan to replace it with a local action over `@floating-ui/dom` (Task 9 covers usage). Record the decision in the task commit message.

- [ ] **Step 2: Update `package.json` devDependencies and dependencies**

Replace the `devDependencies` block's Svelte-era tooling. Set:

```jsonc
"devDependencies": {
  "@sveltejs/adapter-auto": "^3",
  "@sveltejs/kit": "^2",
  "@sveltejs/package": "^2",
  "@sveltejs/vite-plugin-svelte": "^4",
  "svelte": "^5",
  "svelte-check": "^4",
  "typescript": "^5",
  "vite": "^5",
  "vitest": "^2",
  "@vitest/browser": "^2",
  "@testing-library/svelte": "^5",
  "@testing-library/jest-dom": "^6",
  "jsdom": "^24",
  "@playwright/test": "^1",
  "prettier": "^3",
  "prettier-plugin-svelte": "^3"
},
"dependencies": {
  "@floating-ui/dom": "^1.6"
}
```

Remove: all `rollup*`, `tape-modern`, `svelte2tsx`, `svelte-preprocess`, `sirv-cli`, `cross-env`, `find-in-files` (the cjs scripts that used it are reworked in Task 16), `autoprefixer` (re-add only if a PostCSS step proves necessary), `svelte-highlight`, `fuse.js` (verify these are only used in routes/examples; if so they move to where needed or drop). Keep `svelte-floating-ui` only if Step 1 said so.

- [ ] **Step 3: Update `package.json` scripts**

```jsonc
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "check": "svelte-check --tsconfig ./jsconfig.json",
  "test:unit": "vitest run",
  "test:e2e": "playwright test",
  "test": "npm run test:unit && npm run test:e2e",
  "package": "svelte-package",
  "gen:docs": "node docs/generate_theming_variables_md.cjs",
  "prepublishOnly": "npm run package"
}
```

Remove the old `test`, `test:dev`, `test:browser`, `preprepare`, `prepare`, `postprepare`, `release` hooks (the `remove-styles.cjs`/`post-prepare.cjs` style-stripping dance is dropped — Task 14 makes styles self-contained, so the no-styles build is no longer needed).

- [ ] **Step 4: Update `svelte.config.js` to use the standalone vite plugin preprocessor**

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: { adapter: adapter() },
};

export default config;
```

- [ ] **Step 5: Install and verify dev server boots**

Run: `npm install`
Run: `npm run dev` (start, confirm it serves without compile errors, then stop)
Expected: dev server starts; the demo routes render. The current `Select.svelte` still works because Svelte 5 compiles unmodified Svelte 3 syntax in legacy mode.

- [ ] **Step 6: Delete the legacy bundler config**

Run: `git rm rollup.config.js`

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json svelte.config.js vite.config.js
git commit -m "chore: upgrade toolchain to Svelte 5 / Kit 2 / Vite 5"
```

---

### Task 2: Stand up Vitest with Testing Library

**Files:**
- Create: `vitest.config.js`
- Create: `vitest-setup.js`
- Create: `tests/unit/smoke.test.js`
- Modify: `vite.config.js`

**Interfaces:**
- Produces: `npm run test:unit` runs Vitest in jsdom with `@testing-library/svelte` and `@testing-library/jest-dom` matchers available; a smoke test passes.

- [ ] **Step 1: Write the failing smoke test**

```js
// tests/unit/smoke.test.js
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ChevronIcon from '../../src/lib/ChevronIcon.svelte';

test('testing-library can render a component', () => {
    const { container } = render(ChevronIcon);
    expect(container.querySelector('svg')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — no vitest config / setup yet (cannot resolve config or `toBeInTheDocument`).

- [ ] **Step 3: Create the Vitest config and setup**

```js
// vitest.config.js
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [svelte({ hot: false })],
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest-setup.js'],
        include: ['tests/unit/**/*.test.js', 'tests/component/**/*.test.js'],
    },
    resolve: { conditions: ['browser'] },
});
```

```js
// vitest-setup.js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Run the smoke test to verify it passes**

Run: `npm run test:unit`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.js vitest-setup.js tests/unit/smoke.test.js
git commit -m "test: add Vitest + Testing Library harness"
```

---

### Task 3: Stand up Playwright

**Files:**
- Create: `playwright.config.js`
- Create: `tests/e2e/smoke.spec.js`

**Interfaces:**
- Produces: `npm run test:e2e` builds/serves the SvelteKit demo and runs a passing smoke spec against it.

- [ ] **Step 1: Write the failing smoke spec**

```js
// tests/e2e/smoke.spec.js
import { expect, test } from '@playwright/test';

test('demo home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e`
Expected: FAIL — no Playwright config; no webServer.

- [ ] **Step 3: Create the Playwright config**

```js
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e',
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
        reuseExistingServer: !process.env.CI,
    },
    use: { baseURL: 'http://localhost:4173' },
});
```

- [ ] **Step 4: Install browsers and run the smoke spec**

Run: `npx playwright install --with-deps chromium`
Run: `npm run test:e2e`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.js tests/e2e/smoke.spec.js
git commit -m "test: add Playwright e2e harness"
```

---

## PHASE 2 — Runes rewrite at parity (CSS untouched)

### Task 4: Port filtering logic to `filtering.svelte.js`

**Files:**
- Create: `src/lib/filtering.svelte.js`
- Create: `tests/unit/filtering.test.js`
- (Source of truth: current `src/lib/filter.js` and the `convertStringItemsToObjects` / `filterGroupedItems` helpers inside `Select.svelte`.)

**Interfaces:**
- Produces:
  - `filterItems(config) -> Item[]` — pure, same inputs as current `filter.js` default export (`{ loadOptions, filterText, items, multiple, value, itemId, groupBy, filterSelectedItems, itemFilter, convertStringItemsToObjects, filterGroupedItems, label }`).
  - `convertStringItemsToObjects(items) -> {index,value,label}[]`.
  - `loadAndConvert({ loadOptions, filterText, convertStringItemsToObjects, onError, onLoaded }) -> Promise<{filteredItems,loading,focused,listOpen}|undefined>` — replaces `get-items.js`; uses callbacks instead of `dispatch`.

- [ ] **Step 1: Write failing tests for pure filtering**

```js
// tests/unit/filtering.test.js
import { describe, expect, test, vi } from 'vitest';
import { filterItems, convertStringItemsToObjects, loadAndConvert } from '../../src/lib/filtering.svelte.js';

const itemFilter = (label, filterText) => `${label}`.toLowerCase().includes(filterText.toLowerCase());
const base = { itemId: 'value', label: 'label', filterSelectedItems: true, itemFilter, convertStringItemsToObjects };

describe('filterItems', () => {
    test('filters by filterText', () => {
        const items = [{ value: 1, label: 'one' }, { value: 2, label: 'two' }];
        expect(filterItems({ ...base, items, filterText: 'two', multiple: false, value: null })).toEqual([items[1]]);
    });

    test('converts string items to objects before filtering', () => {
        const out = filterItems({ ...base, items: ['a', 'b'], filterText: 'a', multiple: false, value: null });
        expect(out).toEqual([{ index: 0, value: 'a', label: 'a' }]);
    });

    test('hides already-selected items when multiple', () => {
        const items = [{ value: 1, label: 'one' }, { value: 2, label: 'two' }];
        const out = filterItems({ ...base, items, filterText: '', multiple: true, value: [{ value: 1, label: 'one' }] });
        expect(out).toEqual([items[1]]);
    });

    test('returns items unchanged when loadOptions present', () => {
        const items = [{ value: 1, label: 'one' }];
        expect(filterItems({ ...base, items, loadOptions: () => {}, filterText: 'zzz', multiple: false, value: null })).toBe(items);
    });
});

test('loadAndConvert calls onLoaded and returns open state', async () => {
    const onLoaded = vi.fn();
    const res = await loadAndConvert({
        loadOptions: async () => [{ value: 1, label: 'one' }],
        filterText: 'o', convertStringItemsToObjects, onError: vi.fn(), onLoaded,
    });
    expect(onLoaded).toHaveBeenCalledWith({ items: [{ value: 1, label: 'one' }] });
    expect(res).toMatchObject({ loading: false, focused: true, listOpen: true });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/filtering.test.js`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `filtering.svelte.js`**

Port `filter.js` verbatim as `filterItems` (rename default export). Move `convertStringItemsToObjects` out of `Select.svelte`. Rewrite `get-items.js` as `loadAndConvert`, replacing the two `dispatch(...)` calls with `onError({ type:'loadOptions', details })` and `onLoaded({ items })` callbacks. `filterGroupedItems` stays passed in from the component (it closes over `groupBy`, `groupFilter`, `createGroupHeaderItem`, `groupHeaderSelectable`), so keep it as a config parameter exactly as current `filter.js` does.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/unit/filtering.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/filtering.svelte.js tests/unit/filtering.test.js
git commit -m "feat: port filtering + loadOptions to rune module with callbacks"
```

---

### Task 5: Convert icon components to runes

**Files:**
- Modify: `src/lib/ChevronIcon.svelte`, `src/lib/ClearIcon.svelte`, `src/lib/LoadingIcon.svelte`
- Create: `tests/component/icons.test.js`

**Interfaces:**
- Produces: three icon components in runes mode. They currently take no props; keep them prop-free but in runes mode (add `<svelte:options runes />` is unnecessary — presence of a rune is enough, but these have no script. Add an empty `<script>let {} = $props();</script>` only if a prop is needed; otherwise they are already valid Svelte 5 and need no change). Verify rather than assume.

- [ ] **Step 1: Write a render test**

```js
// tests/component/icons.test.js
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import ChevronIcon from '../../src/lib/ChevronIcon.svelte';
import ClearIcon from '../../src/lib/ClearIcon.svelte';
import LoadingIcon from '../../src/lib/LoadingIcon.svelte';

test.each([ChevronIcon, ClearIcon, LoadingIcon])('icon renders svg', (Icon) => {
    const { container } = render(Icon);
    expect(container.querySelector('svg')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify fail-or-pass**

Run: `npx vitest run tests/component/icons.test.js`
Expected: PASS if icons already compile under Svelte 5 (they are plain markup + style). If FAIL, note the error.

- [ ] **Step 3: Fix only if needed**

The icons contain no Svelte 3 reactivity, so they compile unchanged. No edit unless Step 2 surfaced an error. Leave styles untouched (Phase 3 handles tokens).

- [ ] **Step 4: Commit**

```bash
git add tests/component/icons.test.js src/lib/*Icon.svelte
git commit -m "test: cover icon components under Svelte 5"
```

---

### Task 6: Build the selection state module

**Files:**
- Create: `src/lib/selection.svelte.js`
- Create: `tests/unit/selection.test.js`
- (Source of truth: `setValue()`, the `justValue` derivation, and value-coercion logic in current `Select.svelte`.)

**Interfaces:**
- Produces:
  - `coerceValue(value, { items, itemId, multiple, label }) -> coerced value` — implements current `setValue()`: a string maps to a matching item or `{ [itemId]: value, label: value }`; a multiple array maps string entries to `{ value, label }`.
  - `computeJustValue(value, itemId, multiple) -> primitive | primitive[] | null` — current read-only `justValue` projection.

- [ ] **Step 1: Write failing tests**

```js
// tests/unit/selection.test.js
import { expect, test } from 'vitest';
import { coerceValue, computeJustValue } from '../../src/lib/selection.svelte.js';

test('coerceValue maps a string to a matching item', () => {
    const items = [{ value: 'a', label: 'Apple' }];
    expect(coerceValue('a', { items, itemId: 'value', multiple: false, label: 'label' })).toEqual(items[0]);
});

test('coerceValue wraps an unmatched string', () => {
    expect(coerceValue('z', { items: [], itemId: 'value', multiple: false, label: 'label' }))
        .toEqual({ value: 'z', label: 'z' });
});

test('coerceValue maps string entries in multiple arrays', () => {
    expect(coerceValue(['x'], { items: [], itemId: 'value', multiple: true, label: 'label' }))
        .toEqual([{ value: 'x', label: 'x' }]);
});

test('computeJustValue projects itemId for single and multiple', () => {
    expect(computeJustValue({ value: 1, label: 'one' }, 'value', false)).toBe(1);
    expect(computeJustValue([{ value: 1 }, { value: 2 }], 'value', true)).toEqual([1, 2]);
    expect(computeJustValue(null, 'value', false)).toBe(null);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/selection.test.js`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `selection.svelte.js`**

Translate current `setValue()` into pure `coerceValue` (return the coerced value instead of mutating `value`). Derive `computeJustValue` from how the current component computes `justValue` (read `itemId` off each item; array when `multiple`, scalar otherwise, `null` when empty).

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/unit/selection.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/selection.svelte.js tests/unit/selection.test.js
git commit -m "feat: add rune-based selection coercion module"
```

---

### Task 7: Build `Item.svelte`

**Files:**
- Create: `src/lib/Item.svelte`
- Create: `tests/component/item.test.js`
- (Source of truth: the `<slot name="item">` default markup and item classes in current `Select.svelte` ~lines 700–725.)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `Item` with props `{ item, index, label = 'label', isActive = false, isHover = false, isFirst = false, isSelectable = true, item: snippet? }`. Renders `item[label]` by default. Exposes no events; click/hover are handled by the parent `List`.

- [ ] **Step 1: Write failing test**

```js
// tests/component/item.test.js
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Item from '../../src/lib/Item.svelte';

test('renders the label by default', () => {
    const { getByText } = render(Item, { props: { item: { value: 1, label: 'Apple' }, index: 0 } });
    expect(getByText('Apple')).toBeInTheDocument();
});

test('applies active and hover classes', () => {
    const { container } = render(Item, { props: { item: { value: 1, label: 'A' }, index: 0, isActive: true, isHover: true } });
    const el = container.querySelector('.item');
    expect(el).toHaveClass('active');
    expect(el).toHaveClass('hover');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/component/item.test.js`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement `Item.svelte`**

```svelte
<script>
    let { item, index, label = 'label', isActive = false, isHover = false, isFirst = false, isSelectable = true } = $props();
</script>

<div class="item" class:active={isActive} class:hover={isHover} class:first={isFirst} class:not-selectable={!isSelectable}>
    {item[label]}
</div>

<style>
    /* Copy the `.item` rule block verbatim from current Select.svelte (Phase 3 tokenizes it). */
</style>
```

Copy the exact `.item`-related CSS rules from `Select.svelte` so visual parity holds. Do not tokenize yet.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/component/item.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/Item.svelte tests/component/item.test.js
git commit -m "feat: extract Item component (runes)"
```

---

### Task 8: Build `SingleSelection.svelte` and `MultiSelection.svelte`

**Files:**
- Create: `src/lib/SingleSelection.svelte`, `src/lib/MultiSelection.svelte`
- Create: `tests/component/selection-display.test.js`
- (Source of truth: the selected-value markup in current `Select.svelte` ~lines 743–790, including the `selection` and `multi-clear-icon` slots and `handleMultiItemClear`.)

**Interfaces:**
- Consumes: `ClearIcon`.
- Produces:
  - `SingleSelection` props `{ value, label = 'label' }` — renders `value[label]`.
  - `MultiSelection` props `{ value, label = 'label', disabled = false, multiFullItemClearable = false, activeValue, onclear(index) }` — renders one chip per item; each chip's clear button calls `onclear(index)`. Default chip content overridable via a `selection` snippet prop (Task 10 wires the snippet through from `Select`).

- [ ] **Step 1: Write failing tests**

```js
// tests/component/selection-display.test.js
import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import SingleSelection from '../../src/lib/SingleSelection.svelte';
import MultiSelection from '../../src/lib/MultiSelection.svelte';

test('SingleSelection shows the label', () => {
    const { getByText } = render(SingleSelection, { props: { value: { value: 1, label: 'One' } } });
    expect(getByText('One')).toBeInTheDocument();
});

test('MultiSelection renders a chip per value and clears by index', async () => {
    const onclear = vi.fn();
    const { getAllByRole } = render(MultiSelection, {
        props: { value: [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }], onclear },
    });
    const buttons = getAllByRole('button');
    await fireEvent.click(buttons[1]);
    expect(onclear).toHaveBeenCalledWith(1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/component/selection-display.test.js`
Expected: FAIL — components missing.

- [ ] **Step 3: Implement both components**

Translate the current selected-value markup. `MultiSelection` renders the chip list; the per-chip clear `<button>` `onclick` calls `onclear(index)` (replacing the inline `handleMultiItemClear(i)` dispatch path). Use `onclick` attributes (no `on:`), and compose the old `|preventDefault|stopPropagation` modifiers manually:

```svelte
<button type="button" class="multi-item-clear" onclick={(e) => { e.preventDefault(); e.stopPropagation(); onclear(index); }}>
    <ClearIcon />
</button>
```

Copy the corresponding CSS rules verbatim from `Select.svelte`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/component/selection-display.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/SingleSelection.svelte src/lib/MultiSelection.svelte tests/component/selection-display.test.js
git commit -m "feat: extract Single/MultiSelection components (runes)"
```

---

### Task 9: Build `List.svelte`

**Files:**
- Create: `src/lib/List.svelte`
- Create: `src/lib/floating.svelte.js` (only if Task 1 Step 1 required replacing `svelte-floating-ui`)
- Create: `tests/component/list.test.js`
- (Source of truth: the `<div class="svelte-select-list">` block in current `Select.svelte` ~lines 685–733, plus `handleHover`, `handleItemClick`, `scrollToActiveItem`, and floating-ui setup ~lines 1–6 / list positioning.)

**Interfaces:**
- Consumes: `Item`, `filtering.svelte.js` is NOT used here (the parent passes already-filtered items).
- Produces: `List` with props `{ filteredItems, label = 'label', itemId = 'value', hoverItemIndex = $bindable(0), value, multiple = false, groupHeaderSelectable = false, listAutoWidth = true, floatingConfig = {}, onhover(index), onselect(item), item: snippet?, empty: snippet?, listPrepend: snippet?, listAppend: snippet? }`. Renders items via `Item` (or the `item` snippet), shows the `empty` snippet when no items, positions itself with floating-ui, and scrolls the active/hover item into view.

- [ ] **Step 1: Write failing tests**

```js
// tests/component/list.test.js
import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import List from '../../src/lib/List.svelte';

const items = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }];

test('renders one row per filtered item', () => {
    const { getByText } = render(List, { props: { filteredItems: items } });
    expect(getByText('One')).toBeInTheDocument();
    expect(getByText('Two')).toBeInTheDocument();
});

test('clicking an item fires onselect with that item', async () => {
    const onselect = vi.fn();
    const { getByText } = render(List, { props: { filteredItems: items, onselect } });
    await fireEvent.click(getByText('Two'));
    expect(onselect).toHaveBeenCalledWith(items[1]);
});

test('shows empty state when no items', () => {
    const { getByText } = render(List, { props: { filteredItems: [] } });
    expect(getByText('No options')).toBeInTheDocument();
});
```

(Note: current default empty text is `No options`; confirm against `Select.svelte` and match exactly.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/component/list.test.js`
Expected: FAIL — component missing.

- [ ] **Step 3: Implement `List.svelte`**

Translate the list markup to runes. Replace each `on:` with `onclick`/`onmouseover`/`onfocus` attributes, composing former modifiers in-handler. Use a `{#snippet}` fallback for item/empty: render `item` snippet if provided else `<Item .../>`; render `empty` snippet if provided else the default empty `<div>`. For positioning: if `svelte-floating-ui` supports Svelte 5, use its `createFloatingActions` as today; otherwise implement `floating.svelte.js`:

```js
// src/lib/floating.svelte.js
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

// Action pair mirroring svelte-floating-ui's createFloatingActions: returns [ref, content].
export function createFloatingActions(initOptions = {}) {
    let referenceEl, floatingEl, options = initOptions;
    const update = () => {
        if (!referenceEl || !floatingEl) return;
        computePosition(referenceEl, floatingEl, {
            strategy: options.strategy ?? 'absolute',
            placement: options.placement ?? 'bottom-start',
            middleware: [offset(options.offset ?? 5), flip(), shift()],
        }).then(({ x, y, strategy }) => {
            Object.assign(floatingEl.style, { position: strategy, left: `${x}px`, top: `${y}px` });
        });
    };
    const ref = (node) => { referenceEl = node; return { destroy() { referenceEl = null; } }; };
    const content = (node) => {
        floatingEl = node;
        const cleanup = autoUpdate(referenceEl, floatingEl, update);
        return { update(o) { options = { ...initOptions, ...o }; update(); }, destroy() { cleanup(); floatingEl = null; } };
    };
    return [ref, content, update];
}
```

Use `$effect` to scroll the active/hover item into view after DOM update (translate `scrollToActiveItem`). Use `$bindable` for `hoverItemIndex`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/component/list.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/List.svelte tests/component/list.test.js src/lib/floating.svelte.js
git commit -m "feat: extract List component (runes + floating-ui)"
```

---

### Task 10: Rewrite `Select.svelte` as the runes coordinator

**Files:**
- Modify (full rewrite): `src/lib/Select.svelte`
- Delete: `src/lib/filter.js`, `src/lib/get-items.js`
- Create: `tests/component/select-core.test.js`
- (Source of truth: the entirety of current `Select.svelte` — props 15–78, handlers, template 671–828.)

**Interfaces:**
- Consumes: `List`, `SingleSelection`, `MultiSelection`, `Item`, `ChevronIcon`, `ClearIcon`, `LoadingIcon`, `selection.svelte.js`, `filtering.svelte.js`, `floating.svelte.js`/`svelte-floating-ui`.
- Produces: the public component. Props via `$props()`; bindables: `value`, `filterText`, `listOpen`, `focused`, `hoverItemIndex`, `justValue` (read-only output). Callback props replacing events:
  `onchange`, `onselect`, `oninput`, `onclear`, `onfocus`, `onblur`, `onhoveritem`, `onfilter`, `onerror`, `onloaded`. Snippet props replacing slots: `prepend`, `selection`, `clearIcon`, `multiClearIcon`, `loadingIcon`, `chevronIcon`, `list`, `listPrepend`, `listAppend`, `item`, `empty`, `inputHidden`, `required`.

- [ ] **Step 1: Write failing core behavior tests**

```js
// tests/component/select-core.test.js
import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';
import Select from '../../src/lib/Select.svelte';

const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];

test('clicking the control opens the list', async () => {
    const { container, getByText } = render(Select, { props: { items } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    expect(getByText('Apple')).toBeInTheDocument();
});

test('selecting an item fires onchange and onselect with the item', async () => {
    const onchange = vi.fn();
    const onselect = vi.fn();
    const { container, getByText } = render(Select, { props: { items, onchange, onselect } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    await fireEvent.click(getByText('Banana'));
    expect(onselect).toHaveBeenCalledWith(items[1]);
    expect(onchange).toHaveBeenCalledWith(items[1]);
});

test('clear button wipes the value and fires onclear', async () => {
    const onclear = vi.fn();
    const { container } = render(Select, { props: { items, value: items[0], onclear } });
    await fireEvent.click(container.querySelector('.clear-select'));
    expect(onclear).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/component/select-core.test.js`
Expected: FAIL — current component still uses events, not callback props.

- [ ] **Step 3: Rewrite the `<script>` to runes**

Convert per the spec:
- `let { ...props } = $props()` with defaults matching current `export let` defaults (15–78). Use `$bindable()` for the six bindables. Rename `class` → `containerClasses` via `let { class: containerClasses = '' } = $props()`.
- Replace every `dispatch('x', payload)` with the matching callback prop call guarded by existence: `oninput?.(value)`, `onchange?.(value)`, `onselect?.(selection)`, `onclear?.(removed)`, `onfocus?.(e)`, `onblur?.(e)`, `onhoveritem?.(i)`, `onfilter?.(items)`. Pass `onerror`/`onloaded` into `loadAndConvert`.
- Convert the 32 `$:` statements: pure ones (`filteredItems`, `_inputAttributes`, has-value flags) → `$derived`/`$derived.by`; sync ones (firing callbacks on value change, floating updates, scroll) → `$effect`. Remove `beforeUpdate`/`afterUpdate`/`onMount`/`onDestroy` reactivity that becomes derived; keep genuine lifecycle (`onMount`/`onDestroy`) only where binding to DOM/listeners.
- Replace the `prev_value`/`prev_filterText`/`prev_multiple` pattern with `$derived` comparisons inside the relevant `$effect`, capturing previous values via a local closure variable updated at the end of the effect.
- Use `coerceValue`/`computeJustValue` from `selection.svelte.js`; `filterItems`/`loadAndConvert`/`convertStringItemsToObjects` from `filtering.svelte.js`. `filterGroupedItems` and `createGroupHeaderItem` remain local (they close over props) and are passed into `filterItems`.

- [ ] **Step 4: Rewrite the template to runes**

- `<svelte:window on:click=… on:keydown=…>` → `<svelte:window onclick={handleClickOutside} onkeydown={handleKeyDown} />`.
- Every `on:event|modifiers` → `onevent` attribute with modifiers composed in the handler.
- Each `<slot name="x" …>default</slot>` → `{#if xSnippet}{@render xSnippet(args)}{:else}default{/if}`. Pass child snippets down to `List` (`item`, `empty`, `listPrepend`, `listAppend`) and `MultiSelection`/`SingleSelection` (`selection`).
- Render `<List ... bind:hoverItemIndex onhover={handleHover} onselect={(item)=>handleItemClick({item})} />` when `listOpen`.
- Render `<SingleSelection>` / `<MultiSelection onclear={handleMultiItemClear}>` for the value area.
- Keep all element class names identical (`svelte-select`, `value-container`, `svelte-select-list`, `clear-select`, `indicators`, etc.) so existing CSS and parity tests match.
- Leave the entire `<style>` block byte-for-byte as it is today (Phase 3 tokenizes it).

- [ ] **Step 5: Delete absorbed modules**

Run: `git rm src/lib/filter.js src/lib/get-items.js`

- [ ] **Step 6: Run core tests to verify pass**

Run: `npx vitest run tests/component/select-core.test.js`
Expected: PASS.

- [ ] **Step 7: Run the whole unit/component suite and svelte-check**

Run: `npm run test:unit`
Run: `npm run check`
Expected: all green; no runes-mode compile errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/Select.svelte tests/component/select-core.test.js
git rm src/lib/filter.js src/lib/get-items.js
git commit -m "feat: rewrite Select as Svelte 5 runes coordinator (callback props + snippets)"
```

---

### Task 11: Achieve full behavioral parity with the legacy suite

**Files:**
- Create: `tests/component/parity/*.test.js` (grouped by area)
- Create: `tests/e2e/select.spec.js` (interaction flows)
- Delete: `test/` (legacy harness) once parity is green.
- (Source of truth: all 189 cases in `test/src/tests.js` and the helper components under `test/src/`.)

**Interfaces:**
- Consumes: the rewritten `Select` and its child components.
- Produces: a parity test set. Each legacy `test('…')` maps to either a Vitest component test (state/render/keyboard via `fireEvent`) or a Playwright spec (true browser behaviors: focus management across multiple selects, scroll-into-view, floating placement top/bottom). Conversion pattern below.

**Conversion pattern (legacy → new):**
- `target.$set({ prop })` → re-render or `rerender({ prop })` in Testing Library; for bindables, pass via props.
- `target.$on('select', fn)` → pass `onselect={fn}` prop.
- DOM assertions stay (querySelector on the same class names).
- Keyboard: `await fireEvent.keyDown(input, { key: 'ArrowDown' })`.

- [ ] **Step 1: Enumerate and bucket the 189 cases**

Read `test/src/tests.js`. Produce a checklist file `tests/component/parity/CHECKLIST.md` listing every legacy test title with a target bucket (component vs e2e). This is the parity contract; do not silently drop any case (project CLAUDE.md: no silent re-scoping). If a case cannot be ported, log why in the checklist and in `docs/POST_WORK_FINDINGS.md`.

- [ ] **Step 2: Port component-bucket tests (write failing, then confirm)**

Translate each component-bucket case using the conversion pattern. Example for "select item from list":

```js
import { fireEvent, render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../../src/lib/Select.svelte';

test('select item from list', async () => {
    const items = [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }];
    let value;
    const { container, getByText } = render(Select, { props: { items, onchange: (v) => (value = v) } });
    await fireEvent.pointerUp(container.querySelector('.svelte-select'));
    await fireEvent.click(getByText('Apple'));
    expect(value).toEqual(items[0]);
});
```

Run after each area file: `npx vitest run tests/component/parity/<area>.test.js` → PASS.

- [ ] **Step 3: Port e2e-bucket tests to Playwright**

For focus-across-selects, scroll-into-view, and floating placement (top/bottom), write specs against a demo route that mounts `Select`. Example:

```js
// tests/e2e/select.spec.js
import { expect, test } from '@playwright/test';

test('list opens below the control by default', async ({ page }) => {
    await page.goto('/examples/props');
    const select = page.locator('.svelte-select').first();
    await select.click();
    const list = page.locator('.svelte-select-list');
    await expect(list).toBeVisible();
});
```

Run: `npm run test:e2e` → PASS.

- [ ] **Step 4: Run the entire suite**

Run: `npm run test`
Expected: every component + e2e test passes; checklist fully accounted for.

- [ ] **Step 5: Remove the legacy harness**

Run: `git rm -r test`

- [ ] **Step 6: Commit**

```bash
git add tests/
git rm -r test
git commit -m "test: port full behavioral parity suite to Vitest + Playwright"
```

---

## PHASE 3 — Layered CSS tokens

### Task 12: Define Tier 1 (primitives) and Tier 2 (semantic) tokens

**Files:**
- Create: `src/lib/styles/tokens.css`
- Modify: `src/lib/index.js` (re-export nothing new, but ensure tokens are importable) — actually tokens load via the component; see Step 3.
- Create: `tests/component/tokens.test.js`

**Interfaces:**
- Produces: a `:where(.svelte-select)`-scoped block defining all Tier 1 primitives and Tier 2 semantic tokens (each Tier 2 token `var(--svelte-select-…primitive…, fallback)`). Using `:where()` keeps specificity 0 so consumer overrides win.

- [ ] **Step 1: Write a failing token-resolution test**

```js
// tests/component/tokens.test.js
import { render } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Select from '../../src/lib/Select.svelte';

test('control background resolves to the surface primitive by default', () => {
    const { container } = render(Select, { props: { items: [] } });
    const root = container.querySelector('.svelte-select');
    const styles = getComputedStyle(root);
    // jsdom resolves declared custom properties on the element/sheet.
    expect(styles.getPropertyValue('--svelte-select-control-bg').trim().length).toBeGreaterThan(0);
});
```

(If jsdom does not resolve sheet-level custom props reliably, move this assertion to a Playwright test reading `getComputedStyle` in a real browser; note the choice in the test file.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/component/tokens.test.js`
Expected: FAIL — tokens not defined.

- [ ] **Step 3: Author `tokens.css` and import it into `Select.svelte`**

Define Tier 1 + Tier 2 exactly as enumerated in the design §4. Import at the top of `Select.svelte`'s module: `import './styles/tokens.css';` (vite-plugin-svelte bundles it; svelte-package copies it). Scope every selector under `:where(.svelte-select)` / `:where(.svelte-select-list)`.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run tests/component/tokens.test.js`
Expected: PASS (or the relocated Playwright assertion passes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/styles/tokens.css src/lib/Select.svelte tests/component/tokens.test.js
git commit -m "feat: add Tier 1 primitive + Tier 2 semantic CSS tokens"
```

---

### Task 13: Refactor component styles to consume Tier 2 tokens

**Files:**
- Modify: `src/lib/Select.svelte`, `List.svelte`, `Item.svelte`, `SingleSelection.svelte`, `MultiSelection.svelte`, icon components — `<style>` blocks only.

**Interfaces:**
- Produces: every visual rule references a Tier 2 `--svelte-select-*` token instead of a hardcoded value. No behavioral change. Parity tests still green.

- [ ] **Step 1: Replace hardcoded values with Tier 2 tokens**

Work file by file. For each declaration, replace the literal (or the old `var(--flat, literal)`) with the corresponding Tier 2 token, e.g. `background: var(--svelte-select-control-bg);`. Keep the old flat var as the fallback temporarily *inside the Tier 2 definition* (Task 14 formalizes aliasing) — do NOT scatter old vars across rules.

- [ ] **Step 2: Visual parity check (e2e screenshot)**

Add `tests/e2e/visual.spec.js` capturing the default control + open list, compare against a baseline screenshot taken from the current build before Phase 3 (store baseline in Step 0 of this task by checking out the pre-Phase-3 commit, screenshotting, and saving). Run: `npm run test:e2e`. Expected: pixel diff within tolerance.

- [ ] **Step 3: Run full suite**

Run: `npm run test`
Expected: all parity tests still pass (class names unchanged; only values are now tokenized).

- [ ] **Step 4: Commit**

```bash
git add src/lib tests/e2e/visual.spec.js
git commit -m "refactor: drive all component styles from Tier 2 tokens"
```

---

### Task 14: Wire Tier 3 deprecation aliases

**Files:**
- Create: `src/lib/styles/aliases.css`
- Modify: `src/lib/Select.svelte` (import aliases)
- Create: `tests/e2e/legacy-vars.spec.js`

**Interfaces:**
- Produces: every one of the ~115 legacy flat vars (from `docs/theming_variables.md`) is honored by mapping it into the Tier 2 layer. Concretely, each Tier 2 token's definition takes the legacy var as its override hook: `--svelte-select-control-bg: var(--background, var(--svelte-select-color-surface));`. So a consumer setting `--background` still themes the control.

- [ ] **Step 1: Write a failing legacy-var test (Playwright, real browser)**

```js
// tests/e2e/legacy-vars.spec.js
import { expect, test } from '@playwright/test';

test('legacy --background still themes the control', async ({ page }) => {
    await page.goto('/examples/style-props');
    // The style-props example sets --background; assert the computed control bg matches.
    const bg = await page.locator('.svelte-select').first().evaluate(
        (el) => getComputedStyle(el).backgroundColor
    );
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
});
```

- [ ] **Step 2: Run to verify failure / current state**

Run: `npm run test:e2e -- legacy-vars`
Expected: FAIL until aliasing is wired (or passes incidentally — then strengthen the assertion to a specific color the example sets).

- [ ] **Step 3: Author `aliases.css` / fold into tokens**

For every legacy var, make the corresponding Tier 2 token read `var(--legacy-name, var(--primitive))`. Generate this mapping from `docs/theming_variables.md` so none is missed. Import `./styles/aliases.css` into `Select.svelte` after `tokens.css`. Mark the file header: `/* DEPRECATED legacy variable aliases — slated for removal in a future major. Prefer --svelte-select-* tokens. */`.

- [ ] **Step 4: Run to verify pass**

Run: `npm run test:e2e -- legacy-vars`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/styles/aliases.css src/lib/Select.svelte tests/e2e/legacy-vars.spec.js
git commit -m "feat: map legacy CSS vars onto tokens as deprecated aliases"
```

---

### Task 15: Add dark mode and regenerate theming docs

**Files:**
- Modify: `src/lib/styles/tokens.css` (dark block)
- Modify: `docs/generate_theming_variables_md.cjs`
- Create: `tests/e2e/dark-mode.spec.js`

**Interfaces:**
- Produces: a dark theme that activates via `[data-theme="dark"]` on or above `.svelte-select` (and optionally `@media (prefers-color-scheme: dark)` gated behind the same attribute to avoid surprising consumers — default to attribute-only, documented). Dark mode overrides only ~8 Tier 1 primitives. `gen:docs` emits the tiered list (primitives, semantic, deprecated).

- [ ] **Step 1: Write a failing dark-mode test**

```js
// tests/e2e/dark-mode.spec.js
import { expect, test } from '@playwright/test';

test('data-theme=dark changes the control surface', async ({ page }) => {
    await page.goto('/examples/props');
    const light = await page.locator('.svelte-select').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.locator('.svelte-select').first().evaluate((el) => el.setAttribute('data-theme', 'dark'));
    const dark = await page.locator('.svelte-select').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(dark).not.toBe(light);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test:e2e -- dark-mode`
Expected: FAIL.

- [ ] **Step 3: Add the dark primitive overrides**

```css
:where(.svelte-select[data-theme='dark'], [data-theme='dark'] .svelte-select) {
    --svelte-select-color-bg: #1e1e24;
    --svelte-select-color-surface: #26262e;
    --svelte-select-color-border: #3a3a44;
    --svelte-select-color-text: #e6e6e6;
    --svelte-select-color-muted: #9a9aa2;
    --svelte-select-color-accent: #3a3a44;
    --svelte-select-color-accent-text: #ffffff;
    --svelte-select-color-danger: #ff6b6b;
}
```

- [ ] **Step 4: Update `generate_theming_variables_md.cjs`**

Rework it to emit three sections (`## Primitives`, `## Semantic tokens`, `## Deprecated aliases`) by scanning `tokens.css` and `aliases.css` instead of scanning `.svelte` files with `find-in-files`. Read the files with `fs`, extract `--svelte-select-*` declarations and the legacy names from `aliases.css`. Run: `npm run gen:docs`; confirm `docs/theming_variables.md` regenerates with the three sections.

- [ ] **Step 5: Run to verify pass**

Run: `npm run test:e2e -- dark-mode`
Run: `npm run gen:docs`
Expected: dark-mode test PASS; docs regenerate.

- [ ] **Step 6: Commit**

```bash
git add src/lib/styles/tokens.css docs/generate_theming_variables_md.cjs docs/theming_variables.md tests/e2e/dark-mode.spec.js
git commit -m "feat: add dark-mode token block and tiered theming docs"
```

---

## PHASE 4 — Docs and examples

### Task 16: Write the migration guide and update the README

**Files:**
- Modify: `MIGRATION_GUIDE.md`, `README.md`

**Interfaces:**
- Produces: a v5→v6 (Svelte 5) migration guide covering events→callback props (full mapping table from §2), slots→snippets (mapping + a before/after example), bindable props, and CSS tokens (new `--svelte-select-*` system, that legacy vars still work but are deprecated, dark-mode usage). README install/usage examples updated to runes API.

- [ ] **Step 1: Write the migration guide**

Add a "Migrating to Svelte 5" section with the exact events→props table, the slots→snippets table, a before/after snippet:

```svelte
<!-- Before (Svelte 3/4) -->
<Select {items} on:select={handleSelect}>
    <div slot="item" let:item>{item.label}</div>
</Select>

<!-- After (Svelte 5) -->
<Select {items} onselect={handleSelect}>
    {#snippet item(item)}<div>{item.label}</div>{/snippet}
</Select>
```

Plus a CSS section: prefer `--svelte-select-*`; legacy vars still resolve but are deprecated; dark mode via `data-theme="dark"`.

- [ ] **Step 2: Update README usage examples**

Replace `on:` and `slot=` examples with callback props and snippets. Update the peer/version requirements to Svelte 5.

- [ ] **Step 3: Commit**

```bash
git add MIGRATION_GUIDE.md README.md
git commit -m "docs: migration guide and README for Svelte 5 API + tokens"
```

---

### Task 17: Update the demo examples to the new API

**Files:**
- Modify: `src/routes/examples/**/*.svelte` (and any `+page.svelte` using `Select`)

**Interfaces:**
- Produces: every demo route compiles in runes mode using callback props + snippets. The demo build (`npm run build`) succeeds; e2e specs that navigate routes pass.

- [ ] **Step 1: Convert each example**

For each example route, replace `on:event` with `onevent`, `<X slot="name">` with `{#snippet name()}…{/snippet}`, and any `let:` slot props with snippet parameters. Update the `style-props` example to demonstrate both a legacy var and a new token (it backs Task 14/15 e2e specs).

- [ ] **Step 2: Build and run e2e**

Run: `npm run build`
Run: `npm run test:e2e`
Expected: build succeeds; all e2e specs pass.

- [ ] **Step 3: Commit**

```bash
git add src/routes
git commit -m "docs: update demo examples to Svelte 5 API and tokens"
```

---

### Task 18: Final verification and version bump

**Files:**
- Modify: `package.json` (version), `CHANGELOG.md`

**Interfaces:**
- Produces: a packaged build (`npm run package`) that emits to `package/`, full green test run, a major version bump and changelog entry.

- [ ] **Step 1: Full verification**

Run: `npm run check`
Run: `npm run test`
Run: `npm run package`
Expected: svelte-check clean; all tests pass; `package/` contains the built component, `index.js`, `index.d.ts`, and the `styles/` CSS.

- [ ] **Step 2: Inspect the package output**

Confirm `package/` includes `tokens.css` and `aliases.css` and that `exports` in `package.json` still points correctly. Verify no `no-styles` artifacts are referenced (that script was removed in Task 1).

- [ ] **Step 3: Bump version and changelog**

Set `package.json` version to the next major (e.g. `6.0.0`). Add a `CHANGELOG.md` entry summarizing: Svelte 5 runes, callback props, snippets, layered tokens, dark mode, deprecated legacy vars, new test stack.

- [ ] **Step 4: Commit**

```bash
git add package.json CHANGELOG.md
git commit -m "chore: release prep — Svelte 5 major (runes + tokens)"
```

---

## Buddy-check directives

This plan carries high-risk signals: a breaking change to the public API of a
published npm package, a 189-case behavioral-parity contract, and a major
release. Recommended buddy-check points (independent two-reviewer cross-check),
to be decided by the human at the handoff:

- **Task 10** (Select coordinator rewrite) — the highest-blast-radius change;
  the runes/`$effect` translation of the 32 reactive statements is where
  subtle behavioral regressions hide.
- **Task 11** (parity suite) — verify the legacy→new test mapping drops nothing
  and that ported assertions actually exercise the original behavior.

Outcome: **Approved — buddy-check Tasks 10 and 11** (independent two-reviewer
cross-check at the review gate for each). Execution mode: inline
(superpowers:executing-plans), batched with checkpoints.

## Self-Review Notes

- **Spec coverage:** §1 architecture → Tasks 4–11 (decomposition). §2 API → Task 10 (props/callbacks/snippets) + Task 16 (documented). §3 reactivity → Task 10 Step 3. §4 tokens → Tasks 12–15. §5 toolchain/tests → Tasks 1–3, 11. §6 phasing → task ordering. Out-of-scope items (presets beyond dark, JS theming API) intentionally absent.
- **Parity guarantee:** Task 11 forces a 1:1 checklist against the 189 legacy cases; no silent drops.
- **Open contingency (not a placeholder):** `svelte-floating-ui` Svelte 5 support is resolved in Task 1 Step 1; Task 9 provides the concrete fallback implementation if needed.
- **Type/name consistency:** callback prop names (`onchange`, `onselect`, `oninput`, `onclear`, `onfocus`, `onblur`, `onhoveritem`, `onfilter`, `onerror`, `onloaded`) and snippet names are fixed in Task 10's Interfaces block and reused verbatim in Tasks 11, 16, 17.
