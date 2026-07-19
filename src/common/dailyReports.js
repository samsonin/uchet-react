export const normalizeDailyReports = daily => {
    if (Array.isArray(daily)) return daily;
    if (!daily || typeof daily !== "object") return [];
    if (daily.id !== undefined || daily.stock_id !== undefined) return [daily];
    if (daily.daily && typeof daily.daily === "object") return normalizeDailyReports(daily.daily);
    if (Array.isArray(daily.data)) return daily.data;

    return Object.values(daily)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(value => value && typeof value === "object");
};

export const normalizeDailyReport = (daily, stockId) => {
    if (!daily || typeof daily !== "object") return null;
    if (daily.daily && typeof daily.daily === "object") return daily.daily;
    if (daily.id !== undefined) return daily;
    if (daily.data && typeof daily.data === "object" && !Array.isArray(daily.data)) return daily.data;

    const reports = normalizeDailyReports(daily);

    return reports.find(report => stockId === undefined || +report.stock_id === +stockId)
        || reports[0]
        || null;
};

export const normalizeCashPaymentDiscrepancies = dailyResponse => (
    (Array.isArray(dailyResponse?.cash_payment_discrepancies)
        ? dailyResponse.cash_payment_discrepancies
        : []
    ).map(item => ({
        id: item.id,
        time: item.time || item.event_time || "",
        stockId: item.stock_id ?? null,
        saleId: item.sale_id ?? null,
        status: item.status || item.comparison_status || "",
        url: item.url || item.evidence_clip_url || (item.evidence_clip || item.clip
            ? "/evidence-clips/" + String(item.evidence_clip || item.clip).replace(/^.*by-source-date\//, "by-source-date/")
            : ""),
    }))
);

export const normalizeDailyEmployees = (employeeIds, users) => (
    (Array.isArray(employeeIds) ? employeeIds : [])
        .map(employeeId => (Array.isArray(users) ? users : [])
            .find(user => +user.id === +employeeId))
        .filter(Boolean)
);

export const findCashPaymentDiscrepancyBySaleId = (discrepancies, saleId) => (
    (Array.isArray(discrepancies) ? discrepancies : [])
        .find(item => item.saleId !== null && item.saleId !== undefined && +item.saleId === +saleId)
);

export const findCashPaymentDiscrepanciesBySaleId = (discrepancies, saleId) => (
    (Array.isArray(discrepancies) ? discrepancies : [])
        .filter(item => item.saleId !== null && item.saleId !== undefined && +item.saleId === +saleId)
);

export const getUnmatchedCashPaymentDiscrepancies = discrepancies => (
    (Array.isArray(discrepancies) ? discrepancies : [])
        .filter(item => item.saleId === null || item.saleId === undefined || item.saleId === "")
);

const parseMaybeJson = value => {
    if (!value || typeof value !== "string") return value || {};

    try {
        return JSON.parse(value);
    } catch (error) {
        return {};
    }
};

const firstNumericValue = values => {
    const found = values.find(value => value !== undefined && value !== null && value !== "");
    const number = Number(found);

    return Number.isFinite(number) ? number : 0;
};

export const getDailySaleProfit = row => {
    const wf = parseMaybeJson(row?.wf);
    const good = row?.good || {};
    const price = firstNumericValue([row?.sum]);
    const cost = firstNumericValue([
        good.remcost,
        good.cost,
        good.purchase_price,
        good.cost_price,
        wf.remcost,
        wf.cost,
        wf.purchase_price,
        wf.cost_price,
        row?.remcost,
        row?.cost,
        row?.purchase_price,
        row?.cost_price,
    ]);

    return price - cost;
};

export const getDailySalesProfit = rows => (
    (Array.isArray(rows) ? rows : [])
        .reduce((sum, row) => sum + getDailySaleProfit(row), 0)
);

export const canViewDailyGoodsProfit = auth => !!auth?.admin && +auth?.organization_id === 1;
