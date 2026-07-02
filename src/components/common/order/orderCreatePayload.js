export const buildOrderCreatePayload = ({
    customer,
    category_id,
    model,
    presum,
    sum,
    fields,
    notifyTelegram,
    canNotifyTelegram = true
}) => {
    const payload = {
        customer,
        category_id,
        model,
        presum,
        sum,
        ...fields
    };

    if (canNotifyTelegram) payload.notify_telegram = Boolean(notifyTelegram);

    return payload;
};
