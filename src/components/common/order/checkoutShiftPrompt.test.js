import {getCheckoutShiftOptions, getCheckoutShiftPromptText} from './checkoutShiftPrompt';

describe('checkout shift prompt', () => {
    test('offers both shifts and explains when closer participated in previous shift', () => {
        const prompt = {
            previous_shift_available: true,
            same_user_in_previous_shift: true,
        };

        expect(getCheckoutShiftOptions(prompt)).toEqual([
            {value: 'previous', label: 'В предыдущую смену'},
            {value: 'new', label: 'В новую смену'},
        ]);
        expect(getCheckoutShiftPromptText(prompt)).toContain('Вы участвовали в предыдущей смене');
    });

    test('offers only a new shift when there is no previous shift', () => {
        expect(getCheckoutShiftOptions({previous_shift_available: false})).toEqual([
            {value: 'new', label: 'В новую смену'},
        ]);
    });

    test('names the current shift when it already belongs to another employee', () => {
        expect(getCheckoutShiftOptions({
            previous_shift_available: true,
            current_shift_available: true,
        })).toEqual([
            {value: 'previous', label: 'В предыдущую смену'},
            {value: 'new', label: 'В текущую смену'},
        ]);
    });
});
