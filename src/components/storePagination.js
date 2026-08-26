export const hasMoreStoreGoods = (receivedCount, limit, isGroup) =>
    !isGroup && receivedCount > limit;
