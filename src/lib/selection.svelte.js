// Coerces a raw `value` prop into the object shape the component renders.
// String -> matching item (by itemId) or a synthesized { [itemId], label }.
// Multiple array -> string entries become { value, label }.
export function coerceValue(value, { items, itemId, multiple }) {
    if (typeof value === 'string') {
        const item = (items || []).find((i) => i[itemId] === value);
        return item || { [itemId]: value, label: value };
    }

    if (multiple && Array.isArray(value) && value.length > 0) {
        return value.map((item) => (typeof item === 'string' ? { value: item, label: item } : item));
    }

    return value;
}

// Read-only projection of `value` down to its itemId(s).
export function computeJustValue(value, itemId, multiple) {
    if (multiple) return value ? value.map((item) => item[itemId]) : null;
    return value ? value[itemId] : value;
}
