import {
    getPassportOcrSessionId,
    isMatchingPassportOcrSession,
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
});
