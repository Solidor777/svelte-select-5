export function convertStringItemsToObjects(_items) {
    return _items.map((item, index) => {
        return { index, value: item, label: `${item}` };
    });
}

export function filterItems({
    loadOptions,
    filterText,
    items,
    multiple,
    value,
    itemId,
    groupBy,
    filterSelectedItems,
    itemFilter,
    convertStringItemsToObjects,
    filterGroupedItems,
    label,
}) {
    if (items && loadOptions) return items;
    if (!items) return [];

    if (items && items.length > 0 && typeof items[0] !== 'object') {
        items = convertStringItemsToObjects(items);
    }

    let filterResults = items.filter((item) => {
        let matchesFilter = itemFilter(item[label], filterText, item);
        if (matchesFilter && multiple && value?.length) {
            matchesFilter = !value.some((x) => {
                return filterSelectedItems ? x[itemId] === item[itemId] : false;
            });
        }

        return matchesFilter;
    });

    if (groupBy) {
        filterResults = filterGroupedItems(filterResults);
    }

    return filterResults;
}

export async function loadAndConvert({ loadOptions, filterText, convertStringItemsToObjects, onError, onLoaded }) {
    let res = await loadOptions(filterText).catch((err) => {
        console.warn('svelte-select loadOptions error :>> ', err);
        onError?.({ type: 'loadOptions', details: err });
    });

    if (res && !res.cancelled) {
        if (res) {
            if (res.length > 0 && typeof res[0] !== 'object') {
                res = convertStringItemsToObjects(res);
            }

            onLoaded?.({ items: res });
        } else {
            res = [];
        }

        return {
            filteredItems: res,
            loading: false,
            focused: true,
            listOpen: true,
        };
    }
}
