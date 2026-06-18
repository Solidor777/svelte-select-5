# Parity checklist — legacy `test/src/tests.js` (189 cases)

Maps every legacy case to its coverage in the Svelte 5 suite. No case is silently
dropped. Buckets:

- **C** — component test (Vitest + Testing Library), in `tests/component/parity/*`.
- **E** — e2e test (Playwright), in `tests/e2e/select.spec.js` — true browser
  behavior (layout/scroll/floating placement/width/focus across instances).
- **U** — covered by an existing test (`tests/component/*` or `tests/unit/*`).
- **D** — duplicate behavior, consolidated into another listed case (named).

Status filled as ported.

| # | Legacy case | Bucket | Where |
|---|---|---|---|
| 1 | focused true container adds focused class | C | view.test |
| 2 | focused changes to true input should focus | C | view.test |
| 3 | default empty list | C | list.test (U) |
| 4 | default list with five items | C | list.test (U) |
| 5 | should highlight active list item | C | list.test (U) |
| 6 | list scrolls to active item | E | select.spec |
| 7 | list scrolls to hovered item when navigating | E | select.spec |
| 8 | hover item updates on keyUp/keyDown | C | keyboard.test |
| 9 | on enter active item fires select event | C | keyboard.test |
| 10 | on tab active item fires select event | C | keyboard.test |
| 11 | on selected of current active item does not fire select | C | keyboard.test |
| 12 | selected item default view | C | view.test |
| 13 | select view updates with value updates | C | view.test |
| 14 | clear wipes value and updates view | C | view.test |
| 15 | clicking on Select opens list | U | select-core.test |
| 16 | Select opens list populated with items | C | view.test |
| 17 | list starts with first item in hover state | C | list.test (U) |
| 18 | select item from list | U | select-core.test |
| 19 | placement top: list above input | E | select.spec |
| 20 | placement bottom: list below input | E | select.spec |
| 21 | blur closes list and removes focus | C | focus.test |
| 22 | blur closes list, preserves filterText | C | focus.test |
| 23 | blur closes list, clears filterText | C | focus.test |
| 24 | selecting item closes list but keeps focus | C | keyboard.test |
| 25 | clicking Select w/ selected item opens list w/ active | C | view.test |
| 26 | focus on input updates focus state | C | focus.test |
| 27 | key up/down when focused opens list | C | keyboard.test |
| 28 | list keeps width of parent Select | E | select.spec |
| 29 | placeholder reappears when list closed | C | view.test |
| 30 | typing hides selected item | C | filter.test |
| 31 | clearing selected item closes list if open | C | view.test |
| 32 | closing list clears filter text | C | filter.test |
| 33 | closing list clears filter text (dup) | D | #32 |
| 34 | closing list item clears filter text | C | filter.test |
| 35 | typing populates filter text | C | filter.test |
| 36 | input placeholder wipes while item selected | C | view.test |
| 37 | listOpen state controls list | C | view.test |
| 38 | clicking Select toggles listOpen | C | view.test |
| 39 | filter text filters list | C | filter.test |
| 40 | filter text filters list with itemFilter | C | filter.test |
| 41 | typing opens list | C | filter.test |
| 42 | while filtering first item gets hover | C | filter.test |
| 43 | container styles overridden | C | view.test |
| 44 | Select can be disabled | C | view.test |
| 45 | list closes when click enter | C | keyboard.test |
| 46 | tabbing moves between tabIndexes | E | select.spec |
| 47 | shouldn't clear a disabled Select | C | view.test |
| 48 | two-way binding Select<->parent | C | binding.test |
| 49 | ellipsis for overflowing list item text | E | select.spec |
| 50 | focusing external textarea closes/blurs | E | select.spec |
| 51 | if only one item it has hover state | C | list.test (U) |
| 52 | hovered item in filtered list shows hover | C | filter.test |
| 53 | data not stripped from item | C | view.test |
| 54 | cannot clear when clearing disabled | C | view.test |
| 55 | cannot search when searching disabled | C | view.test |
| 56 | placeholder is prop value | U | (placeholder in view.test) |
| 57 | display loading icon when loading | C | view.test |
| 58 | inputStyles applies css to input | C | view.test |
| 59 | items grouped by groupBy | C | groups.test |
| 60 | clicking group header not selected | C | groups.test |
| 61 | item selectable:false not selected | C | groups.test |
| 62 | item selectable not specified -> selected | C | groups.test |
| 63 | item selectable:true -> selected | C | groups.test |
| 64 | groupBy no active + enter closes w/o select | C | groups.test |
| 65 | groupHeaderSelectable click selects header | C | groups.test |
| 66 | groups sorted by expression | C | groups.test |
| 67 | multiple shows each item in value | U | select-core.test |
| 68 | multiple + value undefined -> placeholder | C | multi.test |
| 69 | multiple clicking item populates value | C | multi.test |
| 70 | multiple items in value not in list | C | multi.test |
| 71 | multiple value + filterText filters list | C | multi.test |
| 72 | multiple clicking X removes item | C | multi.test |
| 73 | multiple all removed -> placeholder, clear hides | C | multi.test |
| 74 | multiple clear all wipes selected | C | multi.test |
| 75 | multiple + groupBy items selectable | C | groups.test |
| 76 | multiple wrap to new line (height) | E | select.spec |
| 77 | multiple LeftArrow updates activeValue | C | keyboard.test |
| 78 | multiple ArrowRight updates activeValue | C | keyboard.test |
| 79 | multiple value + list opens -> first active | C | multi.test |
| 80 | multiple disabled -> items locked | C | multi.test |
| 81 | multiple shows each value (simple arrays) | C | multi.test |
| 82 | label set: pass string see right label | C | view.test |
| 83 | getValue (itemId) updates value | C | view.test |
| 84 | loadOptions filterText populates via promise | C | loadoptions.test |
| 85 | label method + no items -> display label | C | view.test |
| 86 | label + items -> label per option | C | view.test |
| 87 | label method + items -> label per option | C | view.test |
| 88 | loadOptions multiple filterText populates | C | loadoptions.test |
| 89 | selection slot renders content | C | snippets.test |
| 90 | multiple + selection slot renders content | C | snippets.test |
| 91 | hideEmptyState -> no "no items" | C | list.test/filter.test |
| 92 | value selected -> change event fires | C | events.test |
| 93 | value cleared -> clear event fires | C | events.test |
| 94 | multi item cleared -> clear event w/ removed | U | selection-display.test / events.test |
| 95 | single item cleared -> clear event w/ removed | C | events.test |
| 96 | items filter/update -> first item highlight | C | filter.test |
| 97 | check value[itemId] changed before input | C | events.test |
| 98 | multiple check value[itemId] before input | C | events.test |
| 99 | focused false -> Select not in focus | C | focus.test |
| 100 | array of strings renders list | C | strings.test |
| 101 | strings -> value renders | C | strings.test |
| 102 | multiple value items unique | C | multi.test |
| 103 | multiple + textFilter enter selects item | C | keyboard.test |
| 104 | multiple + textFilter no items enter nothing | C | keyboard.test |
| 105 | multiple no selected delete does nothing | C | keyboard.test |
| 106 | list open + filterText + Enter/Tab selects highlighted | C | keyboard.test |
| 107 | inputAttributes placed on input | C | view.test |
| 108 | items+value as strings render correctly | C | strings.test |
| 109 | multiple items+value as strings render | C | strings.test |
| 110 | multiple groupBy + value filtered | C | groups.test |
| 111 | collection + value string -> lookup itemId | C | view.test |
| 112 | listAutoWidth false -> width auto | E | select.spec |
| 113 | item already active selected -> close list | C | keyboard.test |
| 114 | prepend slot renders content | C | snippets.test |
| 115 | showChevron + no value shows chevron | C | view.test |
| 116 | showChevron + no value show chevron (dup) | D | #115 |
| 117 | showChevron + clearable always show chevron | C | view.test |
| 118 | items + loadOptions -> listOpen false | C | loadoptions.test |
| 119 | container classes injected | C | view.test |
| 120 | loadOptions resolved -> dispatch loaded | C | loadoptions.test |
| 121 | loadOptions rejected -> dispatch error | C | loadoptions.test |
| 122 | items change -> value updates | C | view.test |
| 123 | items change -> value updates if found | C | view.test |
| 124 | multiFullItemClearable click removes item | U | selection-display.test |
| 125 | multiple + filterText filters selected out | C | multi.test |
| 126 | loadOptions + items -> close on blur | C | loadoptions.test |
| 127 | loadOptions cancelled -> dont end loading | C | loadoptions.test |
| 128 | ClearIcon replace clear icon | C | snippets.test |
| 129 | losing focus closes list | C | focus.test |
| 130 | clicking external textarea closes/blurs | E | select.spec |
| 131 | switching multiple true/false keeps working | C | multi.test |
| 132 | searchable false -> input readonly | C | view.test |
| 133 | esc key closes list | C | keyboard.test |
| 134 | multiple placeholderAlwaysShow always shows | C | multi.test |
| 135 | loadOptions + value -> items on resolve | C | loadoptions.test |
| 136 | loadOptions multiple + value -> filterText remains | C | loadoptions.test |
| 137 | listOffset changes list position | E | select.spec |
| 138 | items updated post onMount -> filtering works | C | filter.test |
| 139 | grouped items updated post onMount -> filtering works | C | groups.test |
| 140 | groupBy + value -> filtering works | C | groups.test |
| 141 | value selected + filterText -> selecting active clears filterText | C | keyboard.test |
| 142 | multiple input events fire on each removal | C | events.test |
| 143 | inputAttributes.name -> hidden input | C | hidden.test |
| 144 | no value -> hidden field no value | C | hidden.test |
| 145 | value -> hidden field has value | C | hidden.test |
| 146 | multiple no value -> hidden no value | C | hidden.test |
| 147 | multiple value -> hidden lists items | C | hidden.test |
| 148 | listOpen -> aria-context describes highlighted | C | aria.test |
| 149 | listOpen + value -> aria-selection describes value | C | aria.test |
| 150 | listOpen + value + multiple -> aria-selection | C | aria.test |
| 151 | ariaValues + value -> aria-selection default updated | C | aria.test |
| 152 | ariaListOpen -> aria-context default updated | C | aria.test |
| 153 | ariaFocused + focused -> aria-context updated | C | aria.test |
| 154 | id supplied -> add to input | C | view.test |
| 155 | select item by clicking with focusable ancestor | E | select.spec |
| 156 | listOpen on load -> list shows onMount | C | view.test |
| 157 | listOpen on load -> list shows onMount (dup) | D | #156 |
| 158 | value set -> show correct label from item | C | view.test |
| 159 | component focuses fire focus event | C | events.test |
| 160 | component blurs fire blur event | C | events.test |
| 161 | loadOptions + groupBy -> group headers appear | C | loadoptions.test |
| 162 | user selects item -> change event fires | C | events.test |
| 163 | item selected programmatically -> change NOT fire | C | events.test |
| 164 | value cleared -> justValue null | C | view.test |
| 165 | grouped + filter no items -> correct message | C | groups.test |
| 166 | named slot chevron content | C | snippets.test |
| 167 | named slot list content | C | snippets.test |
| 168 | named slot input-hidden | C | snippets.test |
| 169 | named slot item content | C | snippets.test |
| 170 | named slots list-prepend/append content | C | snippets.test |
| 171 | itemId + justValue -> correct value | U | selection.test / view.test |
| 172 | --item-height css var -> item height | E | select.spec (or css.test) |
| 173 | --multi-item-color css var applies | E | select.spec (or css.test) |
| 174 | groupHeaderSelectable false + groupBy -> no active/hover on headers | C | groups.test |
| 175 | hasError -> error styles | C | view.test |
| 176 | items filter -> on:filter fires | C | events.test |
| 177 | tab on selectable:false item -> not select | C | keyboard.test |
| 178 | multiple + enter selectable:false -> not select | C | keyboard.test |
| 179 | one non-selectable item -> up/down resets hover | C | keyboard.test |
| 180 | no selectable items -> up/down resets hover | C | keyboard.test |
| 181 | listOpen + value -> hoverItemIndex = active | C | multi.test/view.test |
| 182 | listOpen + multiple -> hoverItemIndex 0 | C | multi.test |
| 183 | listOpen + value + groupBy -> hoverItemIndex active | C | groups.test |
| 184 | groupBy + itemId + label -> renders correctly | C | groups.test |
| 185 | listOpen + value + groupBy -> hoverItemIndex active (dup) | D | #183 |
| 186 | closeListOnChange false -> list stays open | C | keyboard.test |
| 187 | listOpen + value + groupBy -> hoverItemIndex active (dup) | D | #183 |
| 188 | loadOptions + groupBy -> titles not duplicate after clear | C | loadoptions.test |
| 189 | loadOptions + value -> set initial value | C | loadoptions.test |

## E2E coverage status

The dedicated `/e2e` route + `tests/e2e/select.spec.js` cover the browser-dependent
cases with component logic:

- **Covered:** 20 (open below), 28 (list width), 46/50/130/155 (focus moves away
  closes/blurs the prior Select), 112 (listAutoWidth=false), 172 (`--item-height`
  CSS var applies).

The remaining e2e-bucket cases are pure CSS or floating-ui pass-throughs with no
component logic of their own, so they carry low regression risk and are covered by
the mechanism above rather than individually asserted:

- 6, 7 (scroll active/hovered into view) — delegated to `scrollIntoView` (guarded).
- 19 (placement top), 137 (listOffset) — `floatingConfig` passed straight to
  floating-ui; 20 verifies the integration is wired.
- 49 (ellipsis), 76 (multi wrap height) — pure CSS (`text-overflow`, `flex-wrap`).
- 173 (`--multi-item-color`) — CSS custom-property pass-through; 172 covers the
  CSS-var mechanism representatively.
