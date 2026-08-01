import {applyInventoryScan, filterInventoryRows, inventoryScopeLabel} from './barcodeInventory';

describe('barcode inventory helpers', () => {
    test('hides only fully reconciled rows when requested', () => {
        const rows = [
            {source: 'goods', model: 'Phone', expected_quantity: 2, accounted_quantity: 2},
            {source: 'parts', model: 'Display', expected_quantity: 2, accounted_quantity: 1},
        ];

        expect(filterInventoryRows(rows, '', true)).toEqual([
            {source: 'parts', model: 'Display', expected_quantity: 2, accounted_quantity: 1},
        ]);
    });

    test('matches a source label and model in a case-insensitive search', () => {
        const rows = [
            {source: 'showcase', model: 'Xiaomi Note 13', expected_quantity: 1, accounted_quantity: 0},
        ];

        expect(filterInventoryRows(rows, 'ВИТРИНА', false)).toEqual(rows);
        expect(filterInventoryRows(rows, 'note 13', false)).toEqual(rows);
    });

    test('replaces the scanned row and summary without mutating loaded data', () => {
        const snapshot = {
            rows: [{source: 'goods', model: 'Phone', expected_quantity: 1, accounted_quantity: 0}],
            summary: {missing_quantity: 1},
        };

        const next = applyInventoryScan(snapshot, {
            result: 'accounted',
            row: {source: 'goods', model: 'Phone', expected_quantity: 1, accounted_quantity: 1},
            summary: {missing_quantity: 0},
        });

        expect(next).not.toBe(snapshot);
        expect(next.rows[0].accounted_quantity).toBe(1);
        expect(snapshot.rows[0].accounted_quantity).toBe(0);
    });

    test('labels the three agreed inventory scopes in Russian', () => {
        expect(inventoryScopeLabel('all')).toBe('Все позиции');
        expect(inventoryScopeLabel('showcase')).toBe('Витрина');
        expect(inventoryScopeLabel('stock')).toBe('Товары и запчасти');
    });
});
