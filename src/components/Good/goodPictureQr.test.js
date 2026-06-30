import {
    getGoodPictureFromSession,
    getGoodPictureSessionId,
    getGoodPictureSessionStatusPath,
    isMatchingGoodPictureSession,
    normalizeGoodPictureSession,
} from "./goodPictureQr";

describe("good picture QR helpers", () => {
    it("normalizes session responses from common backend wrappers", () => {
        expect(normalizeGoodPictureSession({
            session: {
                id: "session-id",
                status: "uploaded",
            },
        })).toEqual({
            id: "session-id",
            status: "uploaded",
        });

        expect(normalizeGoodPictureSession({
            data: {
                session: {
                    token: "token",
                    status: "waiting",
                },
            },
        })).toEqual({
            token: "token",
            status: "waiting",
        });

        expect(normalizeGoodPictureSession({
            good_picture_session: {
                id: "ws-style",
                status: "error",
            },
        })).toEqual({
            id: "ws-style",
            status: "error",
        });
    });

    it("reads session id from id, session_id, or token", () => {
        expect(getGoodPictureSessionId({ id: "a" })).toBe("a");
        expect(getGoodPictureSessionId({ session_id: "b" })).toBe("b");
        expect(getGoodPictureSessionId({ token: "c" })).toBe("c");
        expect(getGoodPictureSessionId(null)).toBe("");
    });

    it("builds polling status path from status_url or public token", () => {
        expect(getGoodPictureSessionStatusPath("goods/picture-sessions", {
            status_url: "goods/picture-sessions/session-id/status",
            token: "token",
        })).toBe("goods/picture-sessions/session-id/status");

        expect(getGoodPictureSessionStatusPath("goods/picture-sessions", {
            id: "internal-id",
            token: "public-token",
        })).toBe("goods/picture-sessions/public-token");
    });

    it("matches active session and barcode when barcode is present", () => {
        expect(isMatchingGoodPictureSession(
            { token: "token", barcode: "123" },
            { token: "token" },
            "123"
        )).toBe(true);

        expect(isMatchingGoodPictureSession(
            { token: "token", barcode: "999" },
            { token: "token" },
            "123"
        )).toBe(false);
    });

    it("matches when backend returns token but active desktop session has session_id first", () => {
        expect(isMatchingGoodPictureSession(
            { token: "public-token", barcode: "123" },
            { session_id: "desktop-session", token: "public-token" },
            "123"
        )).toBe(true);
    });

    it("extracts picture filename from common session response shapes", () => {
        expect(getGoodPictureFromSession({ picture: "direct.jpg" })).toBe("direct.jpg");
        expect(getGoodPictureFromSession({ picture_url: "https://uchet.store/uploads/direct.jpg" })).toBe("https://uchet.store/uploads/direct.jpg");
        expect(getGoodPictureFromSession({ good: { picture: "nested.jpg" } })).toBe("nested.jpg");
        expect(getGoodPictureFromSession({ good: { picture_url: "https://uchet.store/uploads/nested.jpg" } })).toBe("https://uchet.store/uploads/nested.jpg");
        expect(getGoodPictureFromSession(null)).toBe("");
    });
});
