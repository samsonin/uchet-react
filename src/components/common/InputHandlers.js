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
    disabled={disabled}
    style={style}
    value={value}
    onFocus={() => Number.isInteger(value) || setValue(0)}
    onBlur={() => value > 0 || setValue(initValue)}
    onChange={e => intInputHandler(e.target.value, setValue)}
/>

export const line = (label, value, isEditable, onChange) => {

    const isEd = isEditable && typeof (onChange) === 'function'

    if (!isEd) return lineConst(label, value)

    const spanStyle = {width: label.length > 20 ? '75%' : '40%'}

    return <div style={{
        display: 'flex',
        padding: '1rem .5rem'
    }}>

        <span style={spanStyle}>{label}</span>

        <TextField fullWidth value={value || ''} onChange={onChange}/>

    </div>
}

export const lineConst = (label, value) => {

    return <div
        style={{
            display: 'flex',
            padding: '1em .5em',
            borderBottom: '1px solid lightgray'
        }}
        key={uuid()}
    >

        <span style={{
            width: label.length > 20 ? '75%' : '50%'
        }}>
            {label}
        </span>

        <span style={{fontWeight: 'bold'}}>{value}</span>

    </div>
}

export const note = (label, value, isEditable, onChange) => {

    if (!isEditable && !value) return null

    return <div style={{padding: '1rem 0'}}>
        {label}
        <TextareaAutosize style={{width: '100%'}} value={value || ''} onChange={onChange}/>
    </div>
}

