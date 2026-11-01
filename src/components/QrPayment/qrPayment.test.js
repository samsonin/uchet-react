import {
    QR_PAYMENT_BANK_OPENED_PATH,
    formatAmount,
    formatCountdown,
    isFinalStatus,
    isFinalOrder,
    fetchPaymentSession,
    returnUrlFromHash,
    isMobileUserAgent,
    pageStateFromResponse,
    reportBankOpen,
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

    it("reports the move to the bank without touching the bank link", () => {
        const calls = [];
        const url = `https://api.uchet.store/${QR_PAYMENT_BANK_OPENED_PATH}`;
        expect(reportBankOpen(TOKEN, {
            url,
            sendBeacon: (target, body) => {
                calls.push({ target, body });
                return true;
            },
        })).toBe(true);
        expect(calls).toHaveLength(1);
        expect(calls[0].target).toBe(url);
        expect(calls[0].body.get("token")).toBe(TOKEN);
        // Only the token travels: no pay link, no order details.
        expect(Array.from(calls[0].body.keys())).toEqual(["token"]);

        // A malformed token is never reported anywhere.
        expect(reportBankOpen("short", { sendBeacon: () => { throw new Error("must not be called"); } })).toBe(false);
        expect(reportBankOpen("", { sendBeacon: () => { throw new Error("must not be called"); } })).toBe(false);
    });

    it("survives a missing beacon, a network error and a blocked report", async () => {
        let request = null;
        expect(reportBankOpen(TOKEN, {
            fetch: (target, init) => {
                request = { target, init };
                return Promise.reject(new Error("offline"));
            },
        })).toBe(true);
        expect(request.init.method).toBe("POST");
        expect(request.init.keepalive).toBe(true);
        expect(request.init.body.get("token")).toBe(TOKEN);

        // A beacon that refuses the queue falls through to fetch.
        let fetched = 0;
        expect(reportBankOpen(TOKEN, {
            sendBeacon: () => false,
            fetch: () => {
                fetched += 1;
                return Promise.resolve({ ok: true });
            },
        })).toBe(true);
        expect(fetched).toBe(1);

        // Nothing available or everything throwing: the bank still opens.
        expect(reportBankOpen(TOKEN, { sendBeacon: null, fetch: null })).toBe(false);
        expect(reportBankOpen(TOKEN, { sendBeacon: () => { throw new Error("blocked"); }, fetch: null })).toBe(false);
        await Promise.resolve();
    });
});


describe("QR checkout recovery", () => {
    const returnUrl = `https://appblog.ru/pro?lang=ru&paid=1&payment=cp_${"b".repeat(48)}`;
    it("keeps legacy payment links and returns only to the bought-key page", () => {
        const hash = `#${TOKEN}&returnTo=${encodeURIComponent(returnUrl)}`;
        expect(tokenFromHash(hash)).toBe(TOKEN);
        expect(returnUrlFromHash(hash)).toBe(returnUrl);
        expect(returnUrlFromHash(`#${TOKEN}`)).toBeNull();
        for (const bad of [
            returnUrl.replace("appblog.ru", "appblog.ru.evil.test"),
            returnUrl.replace("https:", "http:"),
            returnUrl.replace("/pro?", "/other?"),
            returnUrl + "&redirect=https://evil.test",
            returnUrl + "#private-key",
            returnUrl.replace("cp_", "bad_"),
        ]) expect(returnUrlFromHash(`#${TOKEN}&returnTo=${encodeURIComponent(bad)}`)).toBeNull();
    });
    it("separates money received from access delivered and preserves older API answers", () => {
        expect(isFinalOrder({ status: "pending" })).toBe(false);
        expect(isFinalOrder({ status: "paid", fulfilled: false })).toBe(false);
        expect(isFinalOrder({ status: "paid", fulfilled: true })).toBe(true);
        expect(isFinalOrder({ status: "paid", fulfilled: false, fulfillmentReview: true })).toBe(true);
        expect(isFinalOrder({ status: "paid" })).toBe(true);
    });
    it("requests the public order without reading CRM login storage", async () => {
        const storage = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
        try {
            const request = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ status: "pending" }) }));
            const result = await fetchPaymentSession(TOKEN, { request });
            expect(result).toEqual({ ok: true, status: 200, body: { status: "pending" } });
            expect(storage).not.toHaveBeenCalled();
            expect(request.mock.calls[0][1].credentials).toBe("omit");
            expect(request.mock.calls[0][1].headers.Authorization).toBeUndefined();
        } finally { storage.mockRestore(); }
    });
    it("returns network failures and temporary service errors to the retry loop", async () => {
        expect(await fetchPaymentSession(TOKEN, { request: async () => { throw new Error("offline"); } }))
            .toEqual({ ok: false, status: 0 });
        const response = await fetchPaymentSession(TOKEN, { request: async () => ({ ok: false, status: 503, json: async () => ({}) }) });
        expect(pageStateFromResponse(response)).toEqual({ kind: "unavailable" });
    });
});
