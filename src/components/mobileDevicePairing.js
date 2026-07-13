export const buildMobileDevicePairingPayload = stockId => (
    stockId ? {stock_id: stockId} : undefined
);

export const getMobileDeviceQrPayload = pairingCode => pairingCode?.qr_payload || "";

export const isSuccessfulPairingCodeResponse = res => (
    res?.status >= 200 && res.status < 300 && !!res.body?.qr_payload
);
