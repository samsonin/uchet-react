import {hasMoreStoreGoods} from './storePagination';
import {isStoreFindDisabled} from './storeSearch';

describe('store pagination', () => {
    test('stops requesting more goods after receiving the last short page', () => {
        expect(hasMoreStoreGoods(26, 25, false)).toBe(true);
        expect(hasMoreStoreGoods(25, 25, false)).toBe(false);
        expect(hasMoreStoreGoods(26, 25, true)).toBe(false);
    });
});


describe('store search button', () => {
    test('becomes available for a typed query while the initial request is pending', () => {
        expect(isStoreFindDisabled(true, 'плянш')).toBe(false);
    });
});
