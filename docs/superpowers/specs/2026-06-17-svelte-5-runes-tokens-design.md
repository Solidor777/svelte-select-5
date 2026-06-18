# Svelte 5 + Runes + Layered CSS Tokens — Design

Date: 2026-06-17
Status: Approved (pending spec review)
Scope: Major version upgrade of `svelte-select` from Svelte 3 to Svelte 5.

## Goal

Rewrite `svelte-select` (currently v5.8.3, a single 1,220-line Svelte 3
`Select.svelte`) as an idiomatic **Svelte 5 runes** component, and replace its
flat ~115-variable CSS theming with a **layered design-token system** that allows
full visual customization. This is a breaking, major-version release.

## Decisions (locked during brainstorming)

1. **Clean Svelte 5 rewrite (breaking).** Events become callback props; slots
   become snippets. No legacy-interop layer.
2. **Layered token system** for CSS (primitives → semantic → aliases).
3. **Alias-with-deprecation** for existing flat CSS vars: they keep working,
   marked deprecated for removal in a later major.
4. **Vitest + Playwright** for verification (replaces the rollup + `tape-modern`
   browser harness).
5. **One spec, phased plan:** toolchain → runes rewrite (parity) → layered
   tokens → docs.

## § 1 — Component architecture

Decompose the monolith into focused units coordinated by a slim `Select.svelte`.

`src/lib/` target layout:

| Unit | Responsibility |
|---|---|
| `Select.svelte` | Public API surface (`$props`), state orchestration, keyboard handling, callback dispatch. Thin coordinator. |
| `List.svelte` | Renders filtered items / groups, hover & active state, empty state, virtual-list hook, floating-ui positioning. |
| `Item.svelte` | Single item render + default `item` snippet content. |
| `MultiSelection.svelte` / `SingleSelection.svelte` | Value display in the control. |
| `selection.svelte.js` | Value/selection state machine (rune-based `.svelte.js` module). |
| `filtering.svelte.js` | Filter + group + getItems orchestration (absorbs current `filter.js`, `get-items.js`). |
| `ChevronIcon.svelte`, `ClearIcon.svelte`, `LoadingIcon.svelte` | Icons, retyped, otherwise unchanged. |

Rationale: each unit is independently testable (Vitest), the coordinator stays
context-readable, and snippet boundaries map cleanly to component boundaries.

## § 2 — Public API (breaking changes)

### Events → callback props

| Old (Svelte 3) | New (Svelte 5) | Payload |
|---|---|---|
| `on:change` | `onchange` | selected value |
| `on:select` | `onselect` | selection |
| `on:input` | `oninput` | value |
| `on:clear` | `onclear` | removed item(s) |
| `on:focus` | `onfocus` | event |
| `on:blur` | `onblur` | event |
| `on:hoverItem` | `onhoveritem` | index |
| `on:filter` | `onfilter` | items |

### Slots → snippets

All named slots become snippet props rendered via `{@render}` with preserved
default fallback content:

`prepend`, `selection`, `clear-icon`, `multi-clear-icon`, `loading-icon`,
`chevron-icon`, `list`, `list-prepend`, `list-append`, `item`, `empty`,
`input-hidden`, `required`.

### Props

All current props remain, declared via `$props()`. Two-way-bindable props use
`$bindable()`: `value`, `filterText`, `listOpen`, `focused`, `hoverItemIndex`,
`justValue` (read-only output). The `class` prop keeps its rename:
`let { class: containerClasses } = $props()`.

The full breaking surface is documented in the migration guide (Phase 4).

## § 3 — Reactivity model

Migrate the 32 `$:` statements by intent:

- **Pure computeds** (`filteredItems`, `_inputAttributes`, has-value flags) →
  `$derived` / `$derived.by`.
- **External synchronization only** (firing callback props on value change,
  floating-ui position updates, scroll-into-view) → `$effect`. Never use
  `$effect` to set state that could be `$derived`.
- **Deep state** (`value`, `items`) → `$state` (Proxy-tracked; mutation works,
  no reassignment dance).
- The `prev_value` / `prev_filterText` / `prev_multiple` change-detection pattern
  (currently driving `beforeUpdate`) is replaced by `$derived` comparisons or
  explicit `$effect` dependency tracking. `beforeUpdate`/`afterUpdate` are removed.

## § 4 — Layered CSS token system

Three tiers, all CSS custom properties. No JS theming API (stays pure CSS,
SSR-safe). New tokens are namespaced `--svelte-select-*` to avoid collisions in
consumer apps; bare aliases are retained for back-compat.

**Tier 1 — Primitives** (override these to retheme everything):

```
--svelte-select-color-{bg, surface, border, text, muted, accent, accent-text, danger}
--svelte-select-radius-{sm, md}
--svelte-select-space-{1..4}
--svelte-select-font-{size, family}
--svelte-select-shadow-list
--svelte-select-transition
```

**Tier 2 — Semantic component tokens** reference Tier 1, one per visual part
(control, value, input, list, item, group, multi-item, indicators, icons,
states). Example:

```
--svelte-select-control-bg: var(--svelte-select-color-surface);
--svelte-select-item-hover-bg: var(--svelte-select-color-accent);
--svelte-select-list-shadow: var(--svelte-select-shadow-list);
```

**Tier 3 — Deprecation aliases:** every current flat var resolves through to its
new semantic token, e.g. `--item-hover-bg` falls back to
`--svelte-select-item-hover-bg`. Existing themes keep working; aliases are
documented as deprecated for removal in a later major.

**Dark mode** is a small block overriding ~8 Tier-1 primitives only; no Tier-2
parts are touched.

`docs/generate_theming_variables_md.cjs` is updated to emit the tiered list.

## § 5 — Toolchain & testing

**Upgrade:** `svelte@^5`, `@sveltejs/kit@^2`, `vite@^5+`,
`@sveltejs/package@^2`, `svelte-floating-ui` to its Svelte 5-compatible release,
`typescript@^5`.

**Remove:** `rollup` + all `rollup-plugin-*`, `tape-modern`, `svelte2tsx`,
`svelte-preprocess`, `sirv-cli`.

**Tests:** `vitest` + `@testing-library/svelte` (+ jsdom or `@vitest/browser`)
for component/logic; `@playwright/test` for interaction flows (keyboard nav,
list open/close, multi-select, floating position). Existing `test/` cases are
ported as the parity checklist.

**Build output:** `svelte-package` still emits to `package/`. The
`remove-styles.cjs` / `post-prepare.cjs` scripts are re-evaluated and likely
simplified, since the token system makes component styles self-contained.

## § 6 — Phasing (one ordered plan)

1. **Toolchain up.** Bump/replace deps, update config, achieve a green dev
   server and an empty-but-passing Vitest/Playwright run. No behavior change.
2. **Runes rewrite at parity.** Decompose per §1; migrate to runes, callback
   props, and snippets per §2–§3; port tests. **CSS untouched** (still old vars).
   Goal: behavioral parity with all ported tests green.
3. **Layered tokens.** Introduce the 3-tier system per §4, wire deprecation
   aliases, add dark mode, regenerate theming docs.
4. **Docs.** Migration guide (events→callbacks, slots→snippets, CSS tokens),
   README, and `src/routes/examples/*` updated to the new API.

Each phase is independently verifiable and committable.

## Out of scope

- Shipped theme presets beyond a single dark-mode block (deferred; the layered
  system enables them later).
- A JavaScript theming API.
- New component features beyond Svelte 3 parity.
