const passportFieldAliases = {
    fio: ["fio", "full_name", "name"],
    birthday: ["birthday", "birth_date", "date_of_birth"],
    birth_place: ["birth_place", "birthplace", "place_of_birth"],
    doc_sn: ["doc_sn", "passport_number", "series_number", "document_number"],
    doc_date: ["doc_date", "issue_date", "passport_issue_date"],
    doc_division_name: ["doc_division_name", "issued_by", "passport_issued_by"],
    doc_division_code: ["doc_division_code", "department_code", "passport_department_code"],
    address: ["address", "registration_address", "registered_address"],
};

export const normalizePassportPayload = body => {
    const source = body?.fields
        || body?.customer
        || body?.passport
        || body?.data?.fields
        || body?.data?.customer
        || body?.data?.passport
        || body?.result?.fields
        || body?.result?.customer
        || body?.result?.passport
        || body?.data
        || body?.result
        || body;

    if (!source || typeof source !== "object" || Array.isArray(source)) return {};

    return Object.entries(passportFieldAliases).reduce((acc, [fieldName, aliases]) => {
        const value = aliases
            .map(alias => source[alias])
            .find(candidate => candidate !== undefined && candidate !== null && String(candidate).trim() !== "");

        if (value !== undefined) acc[fieldName] = String(value).trim();

        return acc;
    }, {});
};

export const getPassportOcrSessionId = session => {
    if (!session || typeof session !== "object") return "";

    return String(session.id || session.session_id || session.token || "");
};

export const getPassportOcrSessionStatusPath = (basePath, session) => {
    if (!session || typeof session !== "object") return "";
    if (session.status_url) return String(session.status_url);

    const sessionId = String(session.token || session.id || session.session_id || "");
    if (!sessionId) return "";

    return `${basePath}/${encodeURIComponent(sessionId)}`;
};

export const normalizePassportOcrSession = body => {
    const source = body?.passport_ocr_session || body?.session || body?.data?.session || body?.data || body;
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;

    return source;
};

export const isMatchingPassportOcrSession = (incomingSession, activeSession) => {
    const incomingId = getPassportOcrSessionId(incomingSession);
    const activeId = getPassportOcrSessionId(activeSession);

    return Boolean(incomingId && activeId && incomingId === activeId);
};
