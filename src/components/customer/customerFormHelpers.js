export const PASSPORT_OCR_SESSION_TTL_SECONDS = 5 * 60;

export const buildPassportOcrSessionRequest = () => ({
    expires_in: PASSPORT_OCR_SESSION_TTL_SECONDS,
    ttl: PASSPORT_OCR_SESSION_TTL_SECONDS,
});

export const normalizeCustomerFromBase = customer => {
    if (!customer || typeof customer !== "object") return null;

    return {
        ...customer,
        contacts: Array.isArray(customer.contacts) ? customer.contacts : [],
    };
};
