import {
    PASSPORT_OCR_SESSION_TTL_SECONDS,
    buildPassportOcrSessionRequest,
    normalizeCustomerFromBase,
} from "./customerFormHelpers";

describe("customer form helpers", () => {
    it("keeps detailed customer fields when selecting a customer from the database", () => {
        const customer = normalizeCustomerFromBase({
            id: 7,
            fio: "Иванов Иван",
            phone_number: "999",
            birthday: "1990-01-01",
            birth_place: "Владивосток",
            doc_sn: "1234 567890",
            doc_date: "2020-01-01",
            doc_division_name: "ОВМ",
            doc_division_code: "250-001",
            address: "Адрес",
        });

        expect(customer).toMatchObject({
            id: 7,
            fio: "Иванов Иван",
            phone_number: "999",
            birthday: "1990-01-01",
            birth_place: "Владивосток",
            doc_sn: "1234 567890",
            doc_date: "2020-01-01",
            doc_division_name: "ОВМ",
            doc_division_code: "250-001",
            address: "Адрес",
            contacts: [],
        });
    });

    it("requests passport QR sessions for at least five minutes", () => {
        expect(PASSPORT_OCR_SESSION_TTL_SECONDS).toBe(300);
        expect(buildPassportOcrSessionRequest()).toEqual({
            expires_in: 300,
            ttl: 300,
        });
    });
});
