export const getOrderUrl = (stockId, orderId) => `/order/${stockId}/${orderId}`;

export const openOrderInNewTab = (stockId, orderId, open = window.open) => (
    open(getOrderUrl(stockId, orderId), "_blank", "noopener,noreferrer")
);
