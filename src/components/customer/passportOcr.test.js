import {
    getPassportOcrSessionId,
    getPassportOcrSessionStatusPath,
    isMatchingPassportOcrSession,
    normalizePassportOcrSession,
    normalizePassportPayload,
} from "./passportOcr";

describe("passport OCR helpers", () => {
    it("normalizes fields from flat backend payload", () => {
        expect(normalizePassportPayload({
            full_name: " Иванов Иван Иванович ",
            birth_date: "1990-01-01",
            birthplace: "г. Владивосток",
            passport_number: "1234 567890",
            issue_date: "2020-01-01",
            issued_by: "ОВМ",
            department_code: "250-001",
            registration_address: "адрес",
        })).toEqual({
            fio: "Иванов Иван Иванович",
            birthday: "1990-01-01",
            birth_place: "г. Владивосток",
            doc_sn: "1234 567890",
            doc_date: "2020-01-01",
            doc_division_name: "ОВМ",
            doc_division_code: "250-001",
            address: "адрес",
        });
    });

    it("normalizes fields from nested backend payload", () => {
        expect(normalizePassportPayload({
            data: {
                fields: {
                    fio: "Петров Петр Петрович",
                    doc_sn: "1111 222222",
                },
            },
        })).toEqual({
            fio: "Петров Петр Петрович",
            doc_sn: "1111 222222",
        });
    });

    it("normalizes fields from customer wrapper returned by direct upload", () => {
        expect(normalizePassportPayload({
            ok: true,
            customer: {
                fio: "Сидоров Сидор Сидорович",
                doc_sn: "3333 444444",
            },
        })).toEqual({
            fio: "Сидоров Сидор Сидорович",
            doc_sn: "3333 444444",
        });
    });

    it("returns empty object for invalid payloads", () => {
        expect(normalizePassportPayload(null)).toEqual({});
        expect(normalizePassportPayload([])).toEqual({});
        expect(normalizePassportPayload({ fields: [] })).toEqual({});
    });

    it("reads session id from id, session_id, or token", () => {
        expect(getPassportOcrSessionId({ id: "a" })).toBe("a");
        expect(getPassportOcrSessionId({ session_id: "b" })).toBe("b");
        expect(getPassportOcrSessionId({ token: "c" })).toBe("c");
        expect(getPassportOcrSessionId(null)).toBe("");
    });

    it("matches incoming WS session with active desktop session", () => {
        expect(isMatchingPassportOcrSession(
            { id: "session-id" },
            { session_id: "session-id" }
        )).toBe(true);

        expect(isMatchingPassportOcrSession(
            { token: "token-a" },
            { token: "token-b" }
        )).toBe(false);
    });

    it("normalizes polling session responses from common backend wrappers", () => {
        expect(normalizePassportOcrSession({
            session: {
                id: "session-id",
                status: "recognized",
            },
        })).toEqual({
            id: "session-id",
            status: "recognized",
        });

        expect(normalizePassportOcrSession({
            data: {
                session: {
                    token: "token",
                    status: "recognizing",
                },
            },
        })).toEqual({
            token: "token",
            status: "recognizing",
        });

        expect(normalizePassportOcrSession({
            passport_ocr_session: {
                id: "ws-style",
                status: "error",
            },
        })).toEqual({
            id: "ws-style",
            status: "error",
        });
    });

    it("builds polling status path from explicit status_url or token", () => {
        expect(getPassportOcrSessionStatusPath("ocr/passport/sessions", {
            status_url: "ocr/passport/sessions/session-id/status",
            token: "token",
        })).toBe("ocr/passport/sessions/session-id/status");

        expect(getPassportOcrSessionStatusPath("ocr/passport/sessions", {
            token: "token with spaces",
        })).toBe("ocr/passport/sessions/token%20with%20spaces");

        expect(getPassportOcrSessionStatusPath("ocr/passport/sessions", {
            id: "internal-id",
            token: "public-token",
        })).toBe("ocr/passport/sessions/public-token");
    });
});
