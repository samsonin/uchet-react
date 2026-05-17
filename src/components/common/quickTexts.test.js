import {
    getQuickTextLabel,
    getQuickTextOptions,
    quickTextLabels,
} from "./quickTexts";

describe("quick text helpers", () => {
    const quickTexts = {
        orders: {
            models: [
                { text: "iPhone 12", count: 8 },
                { text: "Samsung A52", count: 4 },
                { text: "", count: 2 },
            ],
            defects: [
                { text: "замена разъема", count: 12 },
                { text: "не заряжается", count: 9 },
            ],
        },
        pool: [
            { text: "замена разъема", count: 12 },
            { text: "стекло", count: 3 },
        ],
    };

    test("returns text values for nested quick text paths", () => {
        expect(getQuickTextOptions(quickTexts, "orders.defects")).toEqual([
            "замена разъема",
            "не заряжается",
        ]);
    });

    test("returns text values for top-level pool", () => {
        expect(getQuickTextOptions(quickTexts, "pool")).toEqual([
            "замена разъема",
            "стекло",
        ]);
    });

    test("ignores missing paths and empty text values", () => {
        expect(getQuickTextOptions(quickTexts, "orders.models")).toEqual([
            "iPhone 12",
            "Samsung A52",
        ]);
        expect(getQuickTextOptions(quickTexts, "sales.items")).toEqual([]);
    });

    test("exposes recommended Russian labels", () => {
        expect(quickTextLabels.orders.models).toBe("Модели заказов");
        expect(quickTextLabels.sales.expenses).toBe("Расходы");
        expect(getQuickTextLabel("pool")).toBe("Все быстрые вводы");
    });
});
