import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import BarcodeInventoryPage from './BarcodeInventoryPage';
import rest from './Rest';

const mockEnqueueSnackbar = jest.fn();

jest.mock('react-redux', () => ({
    connect: () => component => component,
}));

jest.mock('./Rest', () => jest.fn());

jest.mock('./common/CategoryHandler', () => props => (
    <button type="button" onClick={() => props.setId(6)}>Выбрать категорию</button>
));

jest.mock('notistack', () => ({
    useSnackbar: () => ({enqueueSnackbar: mockEnqueueSnackbar}),
}));

describe('barcode inventory scan sound', () => {
    let container;
    let root;
    let originalAudio;

    beforeEach(() => {
        global.IS_REACT_ACT_ENVIRONMENT = true;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        originalAudio = global.Audio;
        global.Audio = jest.fn(() => ({play: jest.fn(() => Promise.resolve())}));
        rest.mockImplementation((url, method) => Promise.resolve(
            method === 'POST'
                ? {
                    status: 200,
                    body: {
                        result: 'accounted',
                        row: {source: 'goods', model: 'Phone', expected_quantity: 1, accounted_quantity: 1},
                        summary: {expected_quantity: 1, accounted_quantity: 1, missing_quantity: 0, missing_cost: 0, missing_sum: 0},
                    },
                }
                : {status: 200, body: {rows: [], summary: {}}}
        ));
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        global.Audio = originalAudio;
        jest.clearAllMocks();
    });

    test('plays the legacy danger sound when the scanner request has no response', async () => {
        rest.mockImplementation((url, method) => Promise.resolve(
            method === 'POST'
                ? {}
                : {status: 200, body: {rows: [], summary: {}}}
        ));

        await act(async () => {
            root.render(<BarcodeInventoryPage app={{current_stock_id: 1}} newScan="112116000000000" setOurBarcode={jest.fn()}/>);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(global.Audio).toHaveBeenCalledWith('/sounds/danger.wav');
    });
    test('plays the legacy success sound after a successful scanner scan', async () => {
        await act(async () => {
            root.render(<BarcodeInventoryPage app={{current_stock_id: 1}} newScan="112116000000000" setOurBarcode={jest.fn()}/>);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(global.Audio).toHaveBeenCalledWith('/sounds/success.wav');
    });

    test('reloads the inventory with the selected category filter', async () => {
        await act(async () => {
            root.render(<BarcodeInventoryPage app={{current_stock_id: 1}} setOurBarcode={jest.fn()}/>);
            await Promise.resolve();
        });

        rest.mockClear();

        await act(async () => {
            [...container.querySelectorAll('button')]
                .find(button => button.textContent === 'Выбрать категорию')
                .click();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(rest).toHaveBeenCalledWith('inventory/1?scope=all&category_id=6');
    });
});
