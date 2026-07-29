import {GatewayDownloadActions, GatewayDownloadQr, GATEWAY_APK_URL} from "./IntegrationSmsPhone";

describe("GatewayDownloadQr", () => {
    it("encodes the stable B2 APK URL", () => {
        const qr = GatewayDownloadQr();

        expect(qr.props.value).toBe(GATEWAY_APK_URL);
        expect(qr.props.value).toBe("https://f005.backblazeb2.com/file/uchet-store/mobile/uchet-sms-gateway-latest.apk");
    });
});

describe("GatewayDownloadActions", () => {
    it("keeps the download controls left and QR pinned right", () => {
        const actions = GatewayDownloadActions();
        const [left, right] = actions.props.children;

        expect(left.props.children[0].props.children).toBe("1. Установите SMS Gateway");
        expect(left.props.xs).toBe(true);
        expect(right.props.xs).toBe("auto");
        expect(right.props.style.marginLeft).toBe("auto");
    });
});
