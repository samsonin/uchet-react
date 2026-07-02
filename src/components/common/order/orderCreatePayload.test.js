import {buildOrderCreatePayload} from "./orderCreatePayload";

describe("order create payload", () => {
    test("includes telegram notification flag when creating an order", () => {
        const customer = {id: 12, fio: "Ivan"};

        expect(buildOrderCreatePayload({
            customer,
            category_id: 5,
            model: "iPhone 13",
            presum: 1000,
            sum: 5000,
            fields: {defect: "screen"},
            notifyTelegram: true
        })).toEqual({
            customer,
            category_id: 5,
            model: "iPhone 13",
            presum: 1000,
            sum: 5000,
            notify_telegram: true,
            defect: "screen"
        });
    });

    test("keeps telegram notification disabled unless checkbox is checked", () => {
        expect(buildOrderCreatePayload({
            customer: {id: 12},
            category_id: 5,
            model: "iPhone 13",
            presum: 0,
            sum: 5000,
            fields: {},
            notifyTelegram: false
        }).notify_telegram).toBe(false);
    });

    test("does not include telegram notification flag for other organizations", () => {
        expect(buildOrderCreatePayload({
            customer: {id: 12},
            category_id: 5,
            model: "iPhone 13",
            presum: 0,
            sum: 5000,
            fields: {},
            notifyTelegram: true,
            canNotifyTelegram: false
        })).not.toHaveProperty("notify_telegram");
    });
});
