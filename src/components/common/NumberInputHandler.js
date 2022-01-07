export const numberInputHandler = (value, setNumber) => {

    const newSum = +value
    if (!isNaN(newSum)) setNumber(newSum)
    else if (value === '-') setNumber(0)

}