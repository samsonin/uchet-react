export const buildMobileDevicePairingPayload = stockId => (
    stockId ? {stock_id: stockId} : undefined
);

export const resolveMobileDeviceStockId = (currentStockId, stocks = []) => {
    if (currentStockId) return Number(currentStockId);
    if (stocks.length === 1) return Number(stocks[0].id);

    return 0;
};

export const shouldSelectMobileDeviceStock = (currentStockId, stocks = []) => (
    !currentStockId && stocks.length > 1
);

export const getMobileDeviceQrPayload = pairingCode => pairingCode?.qr_payload || "";

export const isSuccessfulPairingCodeResponse = res => (
    res?.status >= 200 && res.status < 300 && !!res.body?.qr_payload
);

export const applyMobileDeviceAction = (devices = [], device) => {
    const sameDevice = current => String(current.id) === String(device.id);

    if (device.is_active) {
        return devices.map(current => sameDevice(current)
            ? {...current, is_active: false}
            : current
        );
    }

    return devices.filter(current => !sameDevice(current));
};
