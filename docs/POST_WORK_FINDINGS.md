# Post-Work Findings

Living record of review findings. NOT a to-do list.

## Select runes coordinator — review findings (all Minor)

Two independent reviewers cross-checked the Svelte 5 runes rewrite of `Select.svelte`
against the original Svelte 3 behavior. After debate (with empirical repros on both
Svelte 3.59.2 and 5.0.0), no Critical or Important parity regressions survived. Open
Minor findings:

- **`onhoveritem` extra transient dispatch on same-tick multi-prop changes.** When
  `value`, `listOpen`, and `filterText` change in a single tick (reachable only via
  batched `bind:` prop updates or a `loadOptions` path that sets several at once —
  not by ordinary keystrokes/clicks), two separate effects write `hoverItemIndex` and
  the reader effect emits an intermediate value: rewrite dispatches `[1, 0]` where the
  original dispatched `[0]`. The final value is always correct; only a consumer
  counting/sequencing hover events is affected. The single-writer paths (open,
  filter-narrow, arrow-nav) match the original exactly.
  - The natural value-dedupe guard (`if (i !== last)`) does NOT collapse the burst
    (the values differ). The only fix that restores exact event-sequence parity is
    per-flush microtask coalescing of the dispatch, which changes `onhoveritem` from
    synchronous to async — itself a parity/timing change that could affect consumers
    relying on synchronous dispatch.
  - Decision: kept synchronous; documented divergence. Revisit only if exact
    hover-event-sequence parity is required and async dispatch is acceptable.

- **`value` identity churn in multiple mode (hygiene).** `setupMulti` reassigns
  `value = [...value]` on each relevant flush. This matches the original (which does
  the same), so it is not a divergence. Noted only because any future code comparing
  `value` by reference would need to account for the changing identity.

- **`listOffset` is mount-time only.** `offset(listOffset)` is captured once into the
  floating config (compiler emits `state_referenced_locally`). This matches the
  original, which also never rebuilt the middleware on prop change. Parity-neutral;
  the warning is benign.
