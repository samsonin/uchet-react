import {
    findCashPaymentDiscrepancyBySaleId,
    findCashPaymentDiscrepanciesBySaleId,
    canViewDailyGoodsProfit,
    getDailySalesProfit,
    getUnmatchedCashPaymentDiscrepancies,
    normalizeCashPaymentDiscrepancies,
    normalizeDailyEmployees,
    normalizeDailyReport,
    normalizeDailyReports,
} from "./dailyReports";

describe("daily report normalization", () => {
    test("keeps a plain report object", () => {
        expect(normalizeDailyReport({ id: 4, stock_id: "2" }, 2)).toEqual({ id: 4, stock_id: "2" });
    });

    test("wraps a plain report object as a report list", () => {
        expect(normalizeDailyReports({
            id: 4,
            stock_id: "2",
            sales: [{ id: 99 }],
        })).toEqual([{
            id: 4,
            stock_id: "2",
            sales: [{ id: 99 }],
        }]);
    });

    test("unwraps a report from data", () => {
        expect(normalizeDailyReport({ data: { id: 4, stock_id: "2" } }, 2)).toEqual({ id: 4, stock_id: "2" });
    });

    test("selects a report from keyed data by stock", () => {
        expect(normalizeDailyReport({
            10: { id: 10, stock_id: 1 },
            20: { id: 20, stock_id: "2" },
        }, 2)).toEqual({ id: 20, stock_id: "2" });
    });

    test("unwraps report arrays from data", () => {
        expect(normalizeDailyReports({
            data: [{ id: 4, stock_id: 2 }],
        })).toEqual([{ id: 4, stock_id: 2 }]);
    });

    test("extracts cash payment discrepancies from daily response", () => {
        expect(normalizeCashPaymentDiscrepancies({
            daily: { id: 4, stock_id: 2 },
            cash_payment_discrepancies: [
                {
                    id: 44,
                    time: "2026-05-25 11:46:50",
                    sale_id: null,
                    url: "https://appblog.ru/evidence-clips/a.mp4",
                    status: "подтвержденная передача",
                },
            ],
        })).toEqual([{
            id: 44,
            time: "2026-05-25 11:46:50",
            stockId: null,
            saleId: null,
            status: "подтвержденная передача",
            url: "https://appblog.ru/evidence-clips/a.mp4",
        }]);
    });

    test("matches daily employees to users by numeric id", () => {
        expect(normalizeDailyEmployees([898, "7"], [
            { id: "898", name: "A" },
            { id: 7, name: "B" },
            { id: 10, name: "C" },
        ])).toEqual([
            { id: "898", name: "A" },
            { id: 7, name: "B" },
        ]);
    });

    test("finds a cash payment discrepancy by sale id", () => {
        expect(findCashPaymentDiscrepancyBySaleId([
            { saleId: 93974, url: "https://example.test/93974.mp4" },
            { saleId: null, url: "https://example.test/none.mp4" },
        ], "93974")).toEqual({ saleId: 93974, url: "https://example.test/93974.mp4" });
    });

    test("finds all cash payment discrepancies by sale id", () => {
        expect(findCashPaymentDiscrepanciesBySaleId([
            { id: 23, saleId: 93932, url: "https://example.test/23.mp4" },
            { id: 24, saleId: "93932", url: "https://example.test/24.mp4" },
            { id: 25, saleId: null, url: "https://example.test/none.mp4" },
        ], 93932)).toEqual([
            { id: 23, saleId: 93932, url: "https://example.test/23.mp4" },
            { id: 24, saleId: "93932", url: "https://example.test/24.mp4" },
        ]);
    });

    test("keeps only unmatched cash payment discrepancies", () => {
        expect(getUnmatchedCashPaymentDiscrepancies([
            { saleId: 93974, url: "https://example.test/93974.mp4" },
            { saleId: null, url: "https://example.test/none.mp4" },
            { saleId: "", url: "https://example.test/empty.mp4" },
        ])).toEqual([
            { saleId: null, url: "https://example.test/none.mp4" },
            { saleId: "", url: "https://example.test/empty.mp4" },
        ]);
    });

    test("calculates sales profit from sale price and goods cost", () => {
        expect(getDailySalesProfit([
            { sum: 5000, good: { cost: 3200 } },
            { sum: 2000, good: { remcost: 1200 } },
            { sum: 900, wf: { cost: 300 } },
        ])).toBe(3200);
    });

    test("shows daily goods profit only for organization owner in organization 1", () => {
        expect(canViewDailyGoodsProfit({ admin: true, organization_id: 1 })).toBe(true);
        expect(canViewDailyGoodsProfit({ admin: true, organization_id: 2 })).toBe(false);
        expect(canViewDailyGoodsProfit({ admin: false, organization_id: 1 })).toBe(false);
    });
});
