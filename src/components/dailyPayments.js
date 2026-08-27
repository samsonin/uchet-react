const parsePaymentData = value => {
    if (!value || typeof value !== 'string') return value || {};

    try {
        return JSON.parse(value);
    } catch (error) {
        return {};
    }
};

export const getDailyPaymentSaleId = row => {
    if (row?.action === 'вернули') return row.id;

    const wf = parsePaymentData(row?.wf);
    return row?.sale_id ?? wf?.sale_id ?? row?.id;
};
