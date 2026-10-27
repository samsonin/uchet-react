import {
    formatAmount,
    formatCountdown,
    isFinalStatus,
    isMobileUserAgent,
    pageStateFromResponse,
    safePaymentLink,
    secondsLeft,
    tokenFromHash,
} from "./qrPayment";

const TOKEN = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_AbCdE";

describe("QR payment page helpers", () => {
    it("reads only a well-formed token from the fragment", () => {
        expect(TOKEN).toHaveLength(43);
        expect(tokenFromHash(`#${TOKEN}`)).toBe(TOKEN);
        expect(tokenFromHash(TOKEN)).toBe(TOKEN);
        expect(tokenFromHash("#short")).toBeNull();
        expect(tokenFromHash(`#${TOKEN}x`)).toBeNull();
        expect(tokenFromHash("")).toBeNull();
    });

    it("formats roubles without empty kopecks", () => {
        expect(formatAmount("199.00", "RUB").replace(/\s/g, " ")).toBe("199 ₽");
        expect(formatAmount("1999.00", "RUB").replace(/\s/g, " ")).toBe("1 999 ₽");
        expect(formatAmount("10.50", "RUB").replace(/\s/g, " ")).toBe("10,50 ₽");
    });

    it("counts down to expiry", () => {
        const now = Date.parse("2026-10-28T10:00:00Z");
        expect(secondsLeft("2026-10-28T10:30:00Z", now)).toBe(1800);
        expect(secondsLeft("2026-10-28T09:00:00Z", now)).toBe(0);
        expect(secondsLeft("bad", now)).toBe(0);
        expect(formatCountdown(1800)).toBe("30:00");
        expect(formatCountdown(65)).toBe("1:05");
    });

    it("stops polling only on final statuses", () => {
        expect(isFinalStatus("pending")).toBe(false);
        ["paid", "failed", "expired", "review"].forEach(status => expect(isFinalStatus(status)).toBe(true));
    });

    it("accepts only https payment links", () => {
        expect(safePaymentLink("https://qr.nspk.ru/AD1?type=02&sum=19900")).toBe("https://qr.nspk.ru/AD1?type=02&sum=19900");
        expect(safePaymentLink("javascript:alert(1)")).toBeNull();
        expect(safePaymentLink("http://qr.nspk.ru/AD1")).toBeNull();
        expect(safePaymentLink(null)).toBeNull();
    });

    it("maps API answers to page states", () => {
        expect(pageStateFromResponse({ ok: true, status: 200, body: { status: "pending" } }))
            .toEqual({ kind: "order", order: { status: "pending" } });
        expect(pageStateFromResponse({ ok: false, status: 404 })).toEqual({ kind: "not-found" });
        expect(pageStateFromResponse({ ok: false, status: 400 })).toEqual({ kind: "not-found" });
        expect(pageStateFromResponse({ ok: false, status: 503 })).toEqual({ kind: "unavailable" });
        expect(pageStateFromResponse({})).toEqual({ kind: "network" });
    });

    it("detects phones", () => {
        expect(isMobileUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe(true);
        expect(isMobileUserAgent("Mozilla/5.0 (Linux; Android 15)")).toBe(true);
        expect(isMobileUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(false);
    });
});
