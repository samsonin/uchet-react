import app from "./app";
import { UPD_APP } from "../constants";

describe("app reducer", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test("normalizes keyed daily reports to an array", () => {
        const state = app(undefined, {
            type: UPD_APP,
            data: {
                daily: {
                    12: { stock_id: 1, proceeds: 100 },
                },
            },
        });

        expect(state.daily).toEqual([{ stock_id: 1, proceeds: 100 }]);
    });

    test("normalizes wrapped daily reports to an array", () => {
        const state = app(undefined, {
            type: UPD_APP,
            data: {
                daily: {
                    data: [{ stock_id: 1, proceeds: 100 }],
                },
            },
        });

        expect(state.daily).toEqual([{ stock_id: 1, proceeds: 100 }]);
    });

    test("stores cash payment discrepancies", () => {
        const state = app(undefined, {
            type: UPD_APP,
            data: {
                cash_payment_discrepancies: [
                    { id: 28, sale_id: 93953 },
                ],
            },
        });

        expect(state.cash_payment_discrepancies).toEqual([{ id: 28, sale_id: 93953 }]);
    });

    test("stores CRM leads in common app state", () => {
        const state = app(undefined, {
            type: UPD_APP,
            data: {
                crm_leads: [
                    { id: 15, status: "new", customer_name: "Ivan" },
                ],
            },
        });

        expect(state.crm_leads).toEqual([{ id: 15, status: "new", customer_name: "Ivan" }]);
    });

    test("normalizes stored daily reports", () => {
        window.localStorage.setItem("app", JSON.stringify({
            daily: {
                12: { stock_id: 1, proceeds: 100 },
            },
        }));

        const state = app(undefined, { type: "UNKNOWN" });

        expect(state.daily).toEqual([{ stock_id: 1, proceeds: 100 }]);
    });
});
