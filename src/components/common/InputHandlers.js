import React from "react";

import {TextareaAutosize, TextField} from "@material-ui/core";
import uuid from "uuid";

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

export const sumField = (initValue, value, setValue, style, disabled) => <TextField
    label={Number.isInteger(value) ? initValue : <br/>}
    // label={Number.isInteger(value) ? initValue : 'Предоплата'}
    disabled={disabled}
    style={style}
    value={value}
    onFocus={() => Number.isInteger(value) || setValue(0)}
    onBlur={() => value > 0 || setValue(initValue)}
    onChange={e => intInputHandler(e.target.value, setValue)}
/>

export const line = (label, value, isEditable, onChange) => {

    const style = {
        display: 'flex',
        padding: '1rem .5rem'
    }

    const isEd = isEditable && typeof (onChange) === 'function'

    if (!isEd) style.borderBottom = '1px solid lightgray'

    const isInt = Number.isInteger(value)

    const spanStyle = {width: isInt ? '75%' : isEd ? '40%' : '50%'}

    return <div style={style} key={uuid()}>

        <span style={spanStyle}>
            {label}
        </span>

        {isEd
            ? <TextField fullWidth value={value || ''} onChange={onChange}/>
            : <span style={{fontWeight: 'bold'}}>{value}</span>}

    </div>
}

export const note = (label, value, isEditable, onChange) => {

    if (!isEditable && !value) return null

    return <div style={{padding: '1rem 0'}}>
        {label}
        <TextareaAutosize style={{width: '100%'}} value={value || ''} onChange={onChange}/>
    </div>
}

