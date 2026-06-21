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
