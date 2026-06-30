import {buildPrepaidOrderDraft, buildPrepaidOrderPayload} from "./prepaidOrder";

describe("prepaid order helpers", () => {
    test("builds payload with prepaid id and form data", () => {
        const customer = {id: 7, fio: "Ivan", phone_number: "123"};

        expect(buildPrepaidOrderPayload({
            id: 42,
            created: "2026-06-29",
            item: "iPhone 13",
            presum: 5000,
            sum: 12000,
            customer,
            status: "New",
            note: "display"
        })).toEqual({
            id: 42,
            created: "2026-06-29",
            item: "iPhone 13",
            presum: 5000,
            sum: 12000,
            customer,
            status: "New",
            note: "display"
        });
    });

    test("maps prepaid data to order form draft without backend route", () => {
        const customer = {id: 7, fio: "Ivan", phone_number: "123"};

        expect(buildPrepaidOrderDraft({
            id: 42,
            created: "2026-06-29",
            item: "iPhone 13",
            presum: 5000,
            sum: 12000,
            customer,
            status: "New",
            note: "display"
        })).toEqual({
            id: 42,
            created: "2026-06-29",
            source: "prepaid",
            item: "iPhone 13",
            customer,
            model: "iPhone 13",
            presum: 5000,
            sum: 12000,
            fields: {
                defect: "display"
            }
        });
    });
});
