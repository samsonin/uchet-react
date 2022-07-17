import {TextField} from "@material-ui/core";
import React from "react";

export const intInputHandler = (value, setInt) => {

    const newSum = +value
    if (!isNaN(newSum)) setInt(newSum)

}

export const numberInputHandler = (value, setNumber) => {

    const minisCounter = value.split('-').length
    const newSum = +value.replaceAll('-', '')
    if (!isNaN(newSum)) setNumber(minisCounter % 2 ? newSum : '-' + newSum)

}

export const phoneNumberHandler = value => {

    let val = value.replace(/[^0-9]/g, "")
    if (val.substring(0, 2) === '89') val = '9' + val.substring(2)
    return val

}

export const fioHandler = fio => fio.replace(/[^a-zA-Zа-яёА-ЯЁ ]/g, "")
        .split(' ')
        .map(w => w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
        .join(' ')

export const sumField = (initValue, value, setValue, style, disabled) => {

    console.log(initValue, value)

    return <TextField
        label={Number.isInteger(value) ? initValue : <br/>}
        disabled={disabled}
        style={style}
        value={value}
        onFocus={() => Number.isInteger(value) || setValue(0)}
        onBlur={() => value > 0 || setValue(initValue)}
        onChange={e => intInputHandler(e.target.value, setValue)}
    />
}
