import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import UnifiedInventory from './UnifiedInventory';

jest.mock('./Inventory', () => () => <div data-testid="ordinary-inventory"/>);
jest.mock('./BarcodeInventoryPage', () => () => <div data-testid="barcode-inventory"/>);

describe('unified inventory', () => {
    let container;
    let root;

    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
    });

    test('starts with only equipment disabled and switches to ordinary inventory when enabled', async () => {
        await act(async () => {
            root.render(<UnifiedInventory app={{current_stock_id: 1}}/>);
        });

        expect(container.querySelector('label').textContent).toContain('Только техника');
        expect(container.querySelector('input[type="checkbox"]').checked).toBe(false);
        expect(container.querySelector('[data-testid="barcode-inventory"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="ordinary-inventory"]')).toBeNull();

        await act(async () => {
            container.querySelector('input[type="checkbox"]').click();
        });

        expect(container.querySelector('[data-testid="ordinary-inventory"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="barcode-inventory"]')).toBeNull();
    });

    test('keeps a pending global scan while only equipment is disabled', async () => {
        const setOurBarcode = jest.fn();

        await act(async () => {
            root.render(<UnifiedInventory app={{current_stock_id: 1}} newScan="112116000000000" setOurBarcode={setOurBarcode}/>);
        });

        expect(setOurBarcode).not.toHaveBeenCalled();
    });
});
