import {siteMap} from './SiteMap';

describe('barcode inventory navigation', () => {
    test('makes barcode inventory available to a non-admin employee', () => {
        const employeeItems = siteMap(false);

        expect(employeeItems).toEqual(expect.arrayContaining([
            expect.objectContaining({path: 'barcode-inventory', text: 'Инвентаризация по штрих-коду'}),
        ]));
    });

    test('keeps the legacy inventory entry restricted to administrators', () => {
        expect(siteMap(false)).not.toEqual(expect.arrayContaining([
            expect.objectContaining({path: 'inventory'}),
        ]));
    });
});
