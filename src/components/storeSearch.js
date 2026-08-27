export const isStoreFindDisabled = (isRequest, search) => Boolean(isRequest && !String(search || '').trim());
