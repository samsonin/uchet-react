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

    test('starts in ordinary inventory mode and switches to barcode inventory after enabling scanner', async () => {
        await act(async () => {
            root.render(<UnifiedInventory app={{current_stock_id: 1}}/>);
        });

        expect(container.querySelector('label').textContent).toContain('\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u043a\u0430\u043d\u0435\u0440');
        expect(container.querySelector('[data-testid="ordinary-inventory"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="barcode-inventory"]')).toBeNull();

        await act(async () => {
            container.querySelector('input[type="checkbox"]').click();
        });

        expect(container.querySelector('[data-testid="barcode-inventory"]')).not.toBeNull();
        expect(container.querySelector('[data-testid="ordinary-inventory"]')).toBeNull();
    });

    test('clears a pending global scan while scanner mode is disabled', async () => {
        const setOurBarcode = jest.fn();

        await act(async () => {
            root.render(<UnifiedInventory app={{current_stock_id: 1}} newScan="112116000000000" setOurBarcode={setOurBarcode}/>);
        });

        expect(setOurBarcode).toHaveBeenCalledTimes(1);
    });
});