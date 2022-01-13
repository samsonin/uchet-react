export const intInputHandler = (value, setInt) => {

    const newSum = +value
    if (!isNaN(newSum)) setInt(newSum)
    else if (value === '-') setInt(0)

}

export const numberInputHandler = (value, setNumber) => {

    const minisCounter = value.split('-').length
    const newSum = +value.replaceAll('-', '')
    if (!isNaN(newSum)) setNumber(minisCounter % 2 ? newSum : -newSum)

}