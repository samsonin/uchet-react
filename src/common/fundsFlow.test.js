import { mergeFundsRowsByDate, normalizeFundsRows } from "./fundsFlow";

describe("funds flow helpers", () => {
    const rows = [
        { date: "2026-05-29", morning: 1, proceeds: 2, cashless: 3, handed: 4, evening: 5 },
    ];

    test("normalizes common backend wrappers", () => {
        expect(normalizeFundsRows(rows)).toBe(rows);
        expect(normalizeFundsRows({ data: rows })).toBe(rows);
        expect(normalizeFundsRows({ funds: rows })).toBe(rows);
        expect(normalizeFundsRows({ daily: rows })).toBe(rows);
        expect(normalizeFundsRows({})).toEqual([]);
    });

    test("merges rows by date", () => {
        expect(mergeFundsRowsByDate([
            { date: "2026-05-29", morning: 1, proceeds: 2, cashless: 3, handed: 4, evening: 5 },
            { date: "2026-05-29", morning: 10, proceeds: 20, cashless: 30, handed: 40, evening: 50 },
        ])).toEqual([
            { date: "2026-05-29", morning: 11, proceeds: 22, cashless: 33, handed: 44, evening: 55 },
        ]);
    });
});
