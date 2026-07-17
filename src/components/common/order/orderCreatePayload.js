export const buildOrderCreatePayload = ({
    customer,
    category_id,
    model,
    presum,
    sum,
    fields,
    notifyTelegram,
    canNotifyTelegram = false,
    notifySms,
    canNotifySms = false
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
    if (canNotifySms) payload.notify_sms = Boolean(notifySms);

    return payload;
};
