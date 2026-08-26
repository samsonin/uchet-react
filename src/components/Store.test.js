import {hasMoreStoreGoods} from './storePagination';

describe('store pagination', () => {
    test('stops requesting more goods after receiving the last short page', () => {
        expect(hasMoreStoreGoods(26, 25, false)).toBe(true);
        expect(hasMoreStoreGoods(25, 25, false)).toBe(false);
        expect(hasMoreStoreGoods(26, 25, true)).toBe(false);
    });
});
