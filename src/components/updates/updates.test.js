import {
    getSeenUpdateIds,
    getUnreadUpdates,
    markAllUpdatesSeen,
    markUpdateSeen,
    productUpdates,
} from "./updates";

const storage = {};

beforeEach(() => {
    Object.keys(storage).forEach(key => delete storage[key]);
    Object.defineProperty(window, "localStorage", {
        value: {
            getItem: jest.fn(key => storage[key] || null),
            setItem: jest.fn((key, value) => {
                storage[key] = value;
            }),
        },
        configurable: true,
    });
});

describe("updates", () => {
    it("returns unread updates for the current user", () => {
        markUpdateSeen(productUpdates[0].id, 7);

        const unread = getUnreadUpdates(7);

        expect(unread.map(update => update.id)).not.toContain(productUpdates[0].id);
        expect(unread.length).toBe(productUpdates.length - 1);
    });

    it("keeps QR photo and passport capture in one update", () => {
        expect(productUpdates).toHaveLength(1);
        expect(productUpdates[0].title).toBe("Фото товара и паспорта через QR");
        expect(productUpdates[0].actions).toBeUndefined();
        expect(productUpdates[0].video.src).toBe("https://f005.backblazeb2.com/file/uchet-store/updates/good-picture-qr.mp4");
    });

    it("marks all updates as seen per user", () => {
        markAllUpdatesSeen(8);

        expect(getSeenUpdateIds(8)).toEqual(productUpdates.map(update => update.id));
        expect(getUnreadUpdates(8)).toEqual([]);
        expect(getUnreadUpdates(9)).toEqual(productUpdates);
    });

    it("can describe updates with optional videos", () => {
        const updateWithVideo = productUpdates.find(update => update.video);

        expect(updateWithVideo.video.title).toBeTruthy();
        expect(updateWithVideo.video.src).toBe("https://f005.backblazeb2.com/file/uchet-store/updates/good-picture-qr.mp4");
    });
});
