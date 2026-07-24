import {
    buildMobileDevicePairingPayload,
    getMobileDeviceQrPayload,
    isSuccessfulPairingCodeResponse,
    resolveMobileDeviceStockId,
    shouldSelectMobileDeviceStock,
} from "./mobileDevicePairing";

describe("mobile device pairing helpers", () => {
    test("uses selected stock id when creating a pairing code", () => {
        expect(buildMobileDevicePairingPayload(1)).toEqual({stock_id: 1});
    });

    test("omits payload when stock id is not selected", () => {
        expect(buildMobileDevicePairingPayload(0)).toEqual(undefined);
    });

    test("uses the globally selected stock for pairing", () => {
        expect(resolveMobileDeviceStockId(7, [{id: 1}, {id: 2}])).toBe(7);
        expect(shouldSelectMobileDeviceStock(7, [{id: 1}, {id: 2}])).toBe(false);
    });

    test("uses the only active stock without showing a selector", () => {
        expect(resolveMobileDeviceStockId(0, [{id: 3}])).toBe(3);
        expect(shouldSelectMobileDeviceStock(0, [{id: 3}])).toBe(false);
    });

    test("requires a stock selection only when no stock is selected globally", () => {
        expect(resolveMobileDeviceStockId(0, [{id: 1}, {id: 2}])).toBe(0);
        expect(shouldSelectMobileDeviceStock(0, [{id: 1}, {id: 2}])).toBe(true);
    });

    test("renders qr_payload from backend response", () => {
        expect(getMobileDeviceQrPayload({
            pairing_uri: "wrong",
            qr_payload: "https://api.uchet.store/mobile-devices/pair?code=AB12-CD34",
        })).toBe("https://api.uchet.store/mobile-devices/pair?code=AB12-CD34");
    });

    test("accepts created pairing code responses", () => {
        expect(isSuccessfulPairingCodeResponse({
            status: 201,
            body: {qr_payload: "https://api.uchet.store/mobile-devices/pair?code=AB12-CD34"},
        })).toBe(true);
    });
});
