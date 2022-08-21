import React, {useEffect, useRef, useState} from 'react'
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import rest from "../Rest";
import {fioHandler, phoneNumberHandler} from "./InputHandlers";

const fields = ['id', 'fio', 'phone_number']

let outCount = 0
let inCount = 0

export default function (props) {

    const request = useRef(false)

    const [customers, setCustomers] = useState([])
    const [value, setValue] = useState({})

    useEffect(() => {

        setValue(props.customer)
        setCustomers([])

    }, [props.customer])

    const handlerInput = (val, reason, name) => {

        if (reason === 'clear') {
            props.updateCustomer('phone_number', '')
            props.updateCustomer('fio', '')
            return
        }

        if (reason !== 'input') return

        if (name === 'phone_number') val = phoneNumberHandler(val)
        if (name === 'fio') val = fioHandler(val)

        props.updateCustomer(name, val)

        if (val.length < 6) return

        request.current = true;
        outCount++

        rest('customers?all=' + val)
            .then(res => {
                request.current = false;
                inCount++
                if (res.ok && outCount === inCount) {
                    setCustomers(res.body || [])
                }
            })

    }

    const handler = val => {

        setValue(val)
        if (val) fields.map(f => props.updateCustomer(f, val[f]))
        setCustomers([])

    }

    return <div
        style={{
            backgroundColor: '#e2f6e2',
            padding: '.5rem',
            margin: '.3rem 0',
            width: '100%'
        }}
    >
        {props.onlySearch || <div style={{
            textDecoration: 'bold',
        }}>
            {props.customer.id
                ? 'Заказчик из базы'
                : 'Новый заказчик'
            }
        </div>}
        {[
            {name: 'phone_number', label: 'Телефон'},
            {name: 'fio', label: 'ФИО'},
        ].map(f => <Autocomplete
            key={'customerselectkeyincustselect' + f.name + f.label}
            disabled={props.disabled}
            style={{margin: '.5rem .3rem'}}
            fullWidth
            value={value}
            options={customers}
            loading={request.current}
            filterSelectedOptions={true}
            filterOptions={options => Object.keys(options).length ? options : true}
            onInputChange={(e, v, r) => handlerInput(v, r, f.name)}
            onChange={(e, v) => handler(v)}
            getOptionLabel={option => option ? option[f.name] || '' : ''}
            getOptionSelected={option => option.id === props.customer.id}
            renderInput={params => <TextField
                {...params}
                autoComplete='off'
                label={f.label}
                id={'customer-select-key-in-custselect' + f.name + f.label}
                name={'customer-select-key-in-custselect' + f.name + f.label}
            />}
        />)}
    </div>
}