const CASH_PAYMENT_LABEL = 'Наличные';

const parsePaymentData = value => {
    if (!value || typeof value !== 'string') return value || {};

    try {
        return JSON.parse(value);
    } catch (error) {
        return {};
    }
};

export const getRefundPaymentLabel = (row, paymentTypes = []) => {
    if (row?.action !== 'вернули') return '';

    const wf = parsePaymentData(row.wf);
    const paymentId = wf?.payment_id ?? row?.payment_id ?? 0;

    if (+paymentId === 0) return CASH_PAYMENT_LABEL;

    return paymentTypes.find(type => +type.id === +paymentId)?.name || `#${paymentId}`;
};
