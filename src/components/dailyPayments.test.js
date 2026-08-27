import { getDailyPaymentSaleId } from "./dailyPayments";

describe("daily payment row identifiers", () => {
    it("updates the refund row rather than the original sale referenced in its workflow", () => {
        expect(getDailyPaymentSaleId({
            id: 514,
            action: "вернули",
            wf: {sale_id: 288},
        })).toBe(514);

        expect(getDailyPaymentSaleId({
            id: 31548,
            sale_id: 937,
            action: "0",
            wf: {rem_id: 31548},
        })).toBe(937);
    });
});
