import {GatewayDownloadQr, GATEWAY_APK_URL} from "./IntegrationSmsPhone";

describe("GatewayDownloadQr", () => {
    it("encodes the stable B2 APK URL", () => {
        const qr = GatewayDownloadQr();

        expect(qr.props.value).toBe(GATEWAY_APK_URL);
        expect(qr.props.value).toBe("https://f005.backblazeb2.com/file/uchet-store/mobile/uchet-sms-gateway-latest.apk");
    });
});
