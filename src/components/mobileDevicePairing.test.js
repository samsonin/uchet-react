import {
    buildMobileDevicePairingPayload,
    getMobileDeviceQrPayload,
    isSuccessfulPairingCodeResponse,
} from "./mobileDevicePairing";

describe("mobile device pairing helpers", () => {
    test("uses selected stock id when creating a pairing code", () => {
        expect(buildMobileDevicePairingPayload(1)).toEqual({stock_id: 1});
    });

    test("omits payload when stock id is not selected", () => {
        expect(buildMobileDevicePairingPayload(0)).toEqual(undefined);
    });

    test("renders qr_payload from backend response", () => {
        expect(getMobileDeviceQrPayload({
            pairing_uri: "wrong",
            qr_payload: "uchet-sms://pair?code=AB12-CD34",
        })).toBe("uchet-sms://pair?code=AB12-CD34");
    });

    test("accepts created pairing code responses", () => {
        expect(isSuccessfulPairingCodeResponse({
            status: 201,
            body: {qr_payload: "uchet-sms://pair?code=AB12-CD34"},
        })).toBe(true);
    });
});
