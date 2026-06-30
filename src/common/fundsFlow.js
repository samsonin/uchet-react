export const normalizeFundsRows = body => {
    if (Array.isArray(body)) return body;
    if (!body || typeof body !== "object") return [];

    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.funds)) return body.funds;
    if (Array.isArray(body.daily)) return body.daily;

    return [];
};

export const mergeFundsRowsByDate = rows => {
    const totalData = [];

    normalizeFundsRows(rows).forEach(row => {
        const lastDay = totalData.find(item => item.date === row.date);

        if (lastDay) {
            lastDay.morning += row.morning;
            lastDay.proceeds += row.proceeds;
            lastDay.cashless += row.cashless;
            lastDay.handed += row.handed;
            lastDay.evening += row.evening;
        } else {
            totalData.push({ ...row });
        }
    });

    return totalData;
};
