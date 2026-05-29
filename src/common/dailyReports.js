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
