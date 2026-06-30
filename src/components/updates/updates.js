const UPDATES_STORAGE_KEY = "uchetSeenUpdates";

const getStorageKey = userId => `${UPDATES_STORAGE_KEY}:${userId || "guest"}`;

const readSeenIds = userId => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(getStorageKey(userId)));
        return Array.isArray(stored) ? stored : [];
    } catch (e) {
        return [];
    }
};

const writeSeenIds = (userId, ids) => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(uniqueIds));
    return uniqueIds;
};

export const productUpdates = [
    {
        id: "2026-05-mobile-capture-qr",
        date: "31.05.2026",
        title: "Фото товара и паспорта через QR",
        description: "Загружайте фото товара и данные паспорта с телефона: QR открывает мобильную загрузку прямо из карточки.",
        accent: "QR",
        video: {
            title: "Как загрузить фото товара через QR",
            src: "https://f005.backblazeb2.com/file/uchet-store/updates/good-picture-qr.mp4",
            poster: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 540'%3E%3Crect width='960' height='540' fill='%23101923'/%3E%3Crect x='74' y='74' width='812' height='392' rx='24' fill='%231f3548'/%3E%3Ccircle cx='480' cy='270' r='72' fill='%2366d1c7'/%3E%3Cpath d='M462 232v76l66-38z' fill='%23101923'/%3E%3Ctext x='480' y='418' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='36' font-weight='700'%3E%D0%A4%D0%BE%D1%82%D0%BE %D1%82%D0%BE%D0%B2%D0%B0%D1%80%D0%B0%3C/text%3E%3C/svg%3E",
        },
    },
];

export const getSeenUpdateIds = userId => readSeenIds(userId);

export const getUnreadUpdates = userId => {
    const seen = new Set(readSeenIds(userId));
    return productUpdates.filter(update => !seen.has(update.id));
};

export const markUpdateSeen = (updateId, userId) => {
    const seenIds = readSeenIds(userId);
    return writeSeenIds(userId, [...seenIds, updateId]);
};

export const markAllUpdatesSeen = userId => (
    writeSeenIds(userId, productUpdates.map(update => update.id))
);
