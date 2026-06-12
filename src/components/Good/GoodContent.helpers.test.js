import { getOrderUrl, openOrderInNewTab } from "./GoodContent.helpers";

describe("GoodContent helpers", () => {
    it("builds an order url from stock and order ids", () => {
        expect(getOrderUrl(3, 125)).toBe("/order/3/125");
    });

    it("opens an order in a new tab", () => {
        const open = jest.fn();

        openOrderInNewTab(3, 125, open);

        expect(open).toHaveBeenCalledWith("/order/3/125", "_blank", "noopener,noreferrer");
    });
});
