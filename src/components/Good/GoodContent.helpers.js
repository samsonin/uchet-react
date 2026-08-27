export const getOrderUrl = (stockId, orderId) => `/order/${stockId}/${orderId}`;

export const getSaleUrl = (stockId, barcode, sum) => `sales/${stockId}/${barcode}/${sum}`;

export const withSaleSum = (alias, sum) => ({...alias, sum});

export const openOrderInNewTab = (stockId, orderId, open = window.open) => (
    open(getOrderUrl(stockId, orderId), "_blank", "noopener,noreferrer")
);
