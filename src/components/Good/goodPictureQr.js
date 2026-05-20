export const normalizeGoodPictureSession = body => {
    const source = body?.good_picture_session || body?.session || body?.data?.session || body?.data || body;
    if (!source || typeof source !== "object" || Array.isArray(source)) return null;

    return source;
};

export const getGoodPictureSessionId = session => {
    if (!session || typeof session !== "object") return "";

    return String(session.id || session.session_id || session.token || "");
};

const getGoodPictureSessionIds = session => {
    if (!session || typeof session !== "object") return [];

    return [session.id, session.session_id, session.token]
        .filter(value => value !== undefined && value !== null && String(value) !== "")
        .map(value => String(value));
};

export const getGoodPictureSessionStatusPath = (basePath, session) => {
    if (!session || typeof session !== "object") return "";
    if (session.status_url) return String(session.status_url);

    const sessionId = String(session.token || session.id || session.session_id || "");
    if (!sessionId) return "";

    return `${basePath}/${encodeURIComponent(sessionId)}`;
};

export const isMatchingGoodPictureSession = (incomingSession, activeSession, barcode) => {
    const incomingIds = getGoodPictureSessionIds(incomingSession);
    const activeIds = getGoodPictureSessionIds(activeSession);

    if (!incomingIds.length || !activeIds.length || !incomingIds.some(id => activeIds.includes(id))) return false;
    if (!barcode || incomingSession?.barcode === undefined || incomingSession?.barcode === null) return true;

    return String(incomingSession.barcode) === String(barcode);
};

export const getGoodPictureFromSession = session => {
    if (!session || typeof session !== "object") return "";

    return String(session.picture || session.picture_url || session.good?.picture || session.good?.picture_url || "");
};
