import {canReturnGoodToProvider} from "./GoodActions.helpers";

describe("GoodActions helpers", () => {
    test("allows provider refund actions for stock goods", () => {
        expect(canReturnGoodToProvider({wo: ""})).toBe(true);
        expect(canReturnGoodToProvider({})).toBe(true);
    });

    test("allows provider refund actions for rejected goods", () => {
        expect(canReturnGoodToProvider({wo: "reject"})).toBe(true);
    });

    test("does not allow provider refund actions for spent goods", () => {
        expect(canReturnGoodToProvider({wo: "use"})).toBe(false);
        expect(canReturnGoodToProvider({wo: "sale"})).toBe(false);
        expect(canReturnGoodToProvider({wo: {sale_id: 7}})).toBe(false);
    });
});
