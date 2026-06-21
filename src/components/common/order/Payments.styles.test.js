const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../../..");
const paymentsSource = fs.readFileSync(path.join(root, "src/components/common/order/Payments.js"), "utf8");
const appStyles = fs.readFileSync(path.join(root, "src/index.css"), "utf8");

describe("order payment select styles", () => {
    it("keeps the MUI select native input hidden while payment method rows are disabled", () => {
        expect(paymentsSource).toContain("order-payment-method-control");
        expect(appStyles).toContain(".order-payment-method-control .MuiSelect-nativeInput");
        expect(appStyles).toContain(".order-payment-method-control input.MuiSelect-nativeInput:disabled");
        expect(appStyles).toContain("-webkit-text-fill-color: transparent");
    });
});
