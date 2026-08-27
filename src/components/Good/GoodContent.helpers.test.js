import {
    getOrderUrl,
    getSaleUrl,
    openOrderInNewTab,
    withSaleSum,
} from "./GoodContent.helpers";

describe("GoodContent helpers", () => {
    it("builds an order url from stock and order ids", () => {
        expect(getOrderUrl(3, 125)).toBe("/order/3/125");
    });

    it("opens an order in a new tab", () => {
        const open = jest.fn();

        openOrderInNewTab(3, 125, open);

        expect(open).toHaveBeenCalledWith("/order/3/125", "_blank", "noopener,noreferrer");
    });

    it("uses the currently entered price when creating a sale and printing its receipt", () => {
        expect(getSaleUrl(2, "115104007369", 4200)).toBe("sales/2/115104007369/4200");
        expect(withSaleSum({sum: 3900, model: "Huawei Y9"}, 4200)).toEqual({
            sum: 4200,
            model: "Huawei Y9",
        });
    });
});
