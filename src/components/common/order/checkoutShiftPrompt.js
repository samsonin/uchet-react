export const getCheckoutShiftOptions = prompt => {
    const options = [];

    if (prompt?.previous_shift_available) {
        options.push({value: 'previous', label: 'В предыдущую смену'});
    }

    options.push({
        value: 'new',
        label: prompt?.current_shift_available ? 'В текущую смену' : 'В новую смену',
    });

    return options;
};

export const getCheckoutShiftPromptText = prompt => prompt?.same_user_in_previous_shift
    ? 'Вы участвовали в предыдущей смене. Выберите, к какой смене отнести закрытие и платёж.'
    : 'В предыдущей смене работал другой сотрудник. Выберите, к какой смене отнести закрытие и платёж.';
