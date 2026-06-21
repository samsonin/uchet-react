import {
    buildCompletedPledgesPath,
    buildCopiedPledgeDraft,
    isCompletedPledge,
    normalizeCompletedPledgesResponse,
    splitPledgesByCompletion,
} from "./pledgesHelpers";

describe("pledges helpers", () => {
    it("treats existing non-new pledges as completed", () => {
        expect(isCompletedPledge({ id: 1, status: "new" })).toBe(false);
        expect(isCompletedPledge({ id: 2, status: "новая" })).toBe(false);
        expect(isCompletedPledge({ id: 3, status: "" })).toBe(false);
        expect(isCompletedPledge({ id: 4, status: "sold" })).toBe(true);
        expect(isCompletedPledge({ id: 5, status: "closed" })).toBe(true);
    });

    it("splits pledges into active and completed groups", () => {
        expect(splitPledgesByCompletion([
            { id: 1, status: "new" },
            { id: 2, status: "closed" },
            { id: 3, status: "to_sale" },
        ])).toEqual({
            active: [{ id: 1, status: "new" }],
            completed: [
                { id: 2, status: "closed" },
                { id: 3, status: "to_sale" },
            ],
        });
    });

    it("builds a prefilled draft without creating a new pledge id", () => {
        expect(buildCopiedPledgeDraft({
            id: 9,
            status: "closed",
            customer: { id: 7, fio: "Иванов Иван" },
            model: "redmi",
            imei: "123",
            password: "1111",
            sum: 2500,
            sum2: 3000,
            note: "old",
            sales: [{ id: 1 }],
        })).toEqual({
            customer: { id: 7, fio: "Иванов Иван" },
            model: "redmi",
            imei: "123",
            password: "1111",
            sum: 2500,
            note: "",
        });
    });

    it("builds the paginated completed pledges route", () => {
        expect(buildCompletedPledgesPath()).toBe("pledges/completed?limit=50");
        expect(buildCompletedPledgesPath({
            stockId: 1,
            search: "redmi ax3",
            limit: 200,
            cursor: "2026-05-06T00:00:00Z:2005",
        })).toBe("pledges/completed?limit=100&stock_id=1&search=redmi+ax3&cursor=2026-05-06T00%3A00%3A00Z%3A2005");
    });

    it("normalizes completed pledges response", () => {
        expect(normalizeCompletedPledgesResponse({
            items: [{ id: 1 }],
            next_cursor: "next",
            meta: { limit: 50 },
        })).toEqual({
            items: [{ id: 1 }],
            nextCursor: "next",
            meta: { limit: 50 },
        });

        expect(normalizeCompletedPledgesResponse([])).toEqual({
            items: [],
            nextCursor: "",
            meta: {},
        });
    });
});
