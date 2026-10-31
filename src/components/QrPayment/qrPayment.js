export const QR_PAYMENT_SESSION_PATH = "api/v1/qr-payments/session";
export const QR_PAYMENT_BANK_OPENED_PATH = "api/v1/qr-payments/bank-opened";
export const QR_PAYMENT_POLL_MS = 4000;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const FINAL_STATUSES = ["paid", "failed", "expired", "review"];

/** The token travels only in the fragment, so it never reaches a server log. */
export const tokenFromHash = hash => {
    const token = String(hash || "").replace(/^#/, "").trim();
    return TOKEN_PATTERN.test(token) ? token : null;
};

export const isFinalStatus = status => FINAL_STATUSES.includes(status);

export const formatAmount = (amount, currency) => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return "";
    const text = value.toLocaleString("ru-RU", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return currency === "RUB" ? `${text} ₽` : `${text} ${currency || ""}`.trim();
};

export const secondsLeft = (expiresAt, now = Date.now()) => {
    const end = Date.parse(expiresAt || "");
    return Number.isFinite(end) ? Math.max(0, Math.floor((end - now) / 1000)) : 0;
};

export const formatCountdown = seconds => {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}:${String(rest).padStart(2, "0")}`;
};

export const isMobileUserAgent = userAgent => /Android|iPhone|iPad|iPod/i.test(String(userAgent || ""));

/** Only an https NSPK/bank link may become a QR code or a bank-app button. */
export const safePaymentLink = value => {
    try {
        const url = new URL(String(value || ""));
        return url.protocol === "https:" ? url.toString() : null;
    } catch (e) {
        return null;
    }
};

/** Maps an API answer to what the page shows. */
export const pageStateFromResponse = response => {
    if (response?.ok && response.body && typeof response.body === "object") {
        return { kind: "order", order: response.body };
    }
    if (response?.status === 400 || response?.status === 404) return { kind: "not-found" };
    if (response?.status === 503) return { kind: "unavailable" };
    return { kind: "network" };
};

/**
 * Tells the API that the buyer left for the bank app (promised QR payment).
 * Fire and forget: sendBeacon is queued by the browser even when the page goes
 * to the background, a fetch with keepalive is the fallback, and a failure is
 * ignored — opening the bank and paying never wait for or depend on this.
 * The body is a form (a CORS-simple request), so no preflight can fail it.
 */
export const reportBankOpen = (token, options = {}) => {
    if (!TOKEN_PATTERN.test(String(token || ""))) return false;
    const url = String(options.url || QR_PAYMENT_BANK_OPENED_PATH);
    const body = new URLSearchParams({ token });
    const beacon = options.sendBeacon !== undefined
        ? options.sendBeacon
        : (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function"
            ? (target, data) => navigator.sendBeacon(target, data)
            : null);
    const request = options.fetch !== undefined ? options.fetch : (typeof fetch === "function" ? fetch : null);
    try {
        // A full beacon queue is not the end: the fallback may still get through.
        if (beacon && beacon(url, body) !== false) return true;
        if (request) {
            Promise.resolve(request(url, {
                method: "POST",
                body,
                keepalive: true,
                mode: "cors",
                credentials: "same-origin",
            })).catch(() => {});
            return true;
        }
    } catch (e) {
        // The bank still opens: this is only a hint for the partner.
    }
    return false;
};
