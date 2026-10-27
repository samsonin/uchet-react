export const QR_PAYMENT_SESSION_PATH = "api/v1/qr-payments/session";
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
