export const buildPrepaidOrderPayload = ({
    id,
    created,
    item,
    presum,
    sum,
    customer,
    status,
    note
}) => ({
    id,
    created,
    item,
    presum,
    sum,
    customer,
    status,
    note
});

export const buildPrepaidOrderDraft = prepaid => ({
    id: prepaid.id,
    created: prepaid.created,
    source: 'prepaid',
    item: prepaid.item,
    customer: prepaid.customer,
    model: prepaid.item,
    presum: prepaid.presum,
    sum: prepaid.sum,
    fields: {
        defect: prepaid.note || ''
    }
});