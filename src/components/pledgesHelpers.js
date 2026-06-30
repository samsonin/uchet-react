const activeStatuses = new Set(["", "new", "новая"]);

export const isCompletedPledge = pledge => {
    if (!pledge?.id) return false;

    return !activeStatuses.has(String(pledge.status || "").toLowerCase().trim());
};

export const splitPledgesByCompletion = pledges => (Array.isArray(pledges) ? pledges : [])
    .reduce((groups, pledge) => {
        groups[isCompletedPledge(pledge) ? "completed" : "active"].push(pledge);
        return groups;
    }, {
        active: [],
        completed: [],
    });

export const buildCopiedPledgeDraft = pledge => ({
    customer: pledge?.customer ? { ...pledge.customer } : {},
    model: pledge?.model ?? "",
    imei: pledge?.imei ?? "",
    password: pledge?.password ?? "",
    sum: pledge?.sum ?? 0,
    note: "",
});

export const buildCompletedPledgesPath = ({
    stockId,
    search,
    limit = 50,
    cursor,
} = {}) => {
    const params = new URLSearchParams();

    params.set("limit", String(Math.min(Math.max(+limit || 50, 1), 100)));
    if (stockId) params.set("stock_id", String(stockId));
    if (search) params.set("search", String(search));
    if (cursor) params.set("cursor", String(cursor));

    return `pledges/completed?${params.toString()}`;
};

export const normalizeCompletedPledgesResponse = body => ({
    items: Array.isArray(body?.items) ? body.items : [],
    nextCursor: body?.next_cursor || "",
    meta: body?.meta || {},
});
