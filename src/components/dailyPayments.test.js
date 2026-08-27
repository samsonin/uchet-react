import { getRefundPaymentLabel } from "./dailyPayments";

describe("refund payment method", () => {
    it("shows cash by default and the chosen cashless method for a refund", () => {
        const paymentTypes = [{id: 3, name: "Безнал"}];

        expect(getRefundPaymentLabel({action: "вернули", sum: -3900, wf: {}}, paymentTypes))
            .toBe("Наличные");
        expect(getRefundPaymentLabel({
            action: "вернули",
            sum: -3900,
            wf: {payment_id: 3},
        }, paymentTypes)).toBe("Безнал");
    });

    it("does not add a payment control to non-refund rows", () => {
        expect(getRefundPaymentLabel({action: "продали", sum: 3900, wf: {}}, [])).toBe("");
    });
});
