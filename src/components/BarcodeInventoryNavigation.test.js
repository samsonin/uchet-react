import {siteMap} from './SiteMap';

describe('unified inventory navigation', () => {
    test('makes unified inventory available to a non-admin employee without a separate barcode page', () => {
        const employeeItems = siteMap(false);

        expect(employeeItems).toEqual(expect.arrayContaining([
            expect.objectContaining({path: 'inventory', text: 'Инвентаризация'}),
        ]));
        expect(employeeItems).not.toEqual(expect.arrayContaining([
            expect.objectContaining({path: 'barcode-inventory'}),
        ]));
    });
});