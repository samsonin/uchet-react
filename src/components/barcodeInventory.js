export const INVENTORY_SCOPES = ['all', 'showcase', 'stock'];

const SOURCE_LABELS = {
    goods: 'Товары',
    parts: 'Запчасти',
    showcase: 'Витрина',
};

export const inventoryScopeLabel = scope => ({
    all: 'Все позиции',
    showcase: 'Витрина',
    stock: 'Товары и запчасти',
}[scope] || 'Инвентаризация');

export const inventorySourceLabel = source => SOURCE_LABELS[source] || source;

export const filterInventoryRows = (rows = [], search = '', hideReconciled = false) => {
    const tokens = String(search || '')
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    return rows
        .filter(row => !hideReconciled || row.expected_quantity !== row.accounted_quantity)
        .filter(row => tokens.every(token => [row.model, inventorySourceLabel(row.source)]
            .some(value => String(value || '').toLowerCase().includes(token))));
};

export const applyInventoryScan = (snapshot, response) => ({
    ...snapshot,
    summary: response.summary,
    rows: (snapshot.rows || []).map(row => row.source === response.row.source && row.model === response.row.model
        ? response.row
        : row),
});
