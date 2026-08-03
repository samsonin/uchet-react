import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import UnifiedInventory from './UnifiedInventory';

jest.mock('./Inventory', () => () => <div>Обычная инвентаризация</div>);
jest.mock('./BarcodeInventoryPage', () => () => <div>Инвентаризация по штрих-кодам</div>);

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

        expect(container.textContent).toContain('Включить сканер');
        expect(container.textContent).toContain('Обычная инвентаризация');
        expect(container.textContent).not.toContain('Инвентаризация по штрих-кодам');

        await act(async () => {
            container.querySelector('input[type="checkbox"]').click();
        });

        expect(container.textContent).toContain('Инвентаризация по штрих-кодам');
        expect(container.textContent).not.toContain('Обычная инвентаризация');
    });
});
