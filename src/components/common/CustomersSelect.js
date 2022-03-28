import React, {useEffect, useRef, useState} from 'react'
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import rest from "../Rest";

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

        if (reason !== 'input') return

        if (name === 'phone_number') val = val.replace(/[^0-9]/g,"")
        if (name === 'fio') val = val.replace(/[^a-zA-Zа-яёА-ЯЁ ]/g,"")

        props.updateCustomer(name, val)

        if (val.length < 4) return

        request.current = true;
        outCount++

        rest('customers?all=' + val)
            .then(res => {
                request.current = false;
                inCount++
                if (res.ok && outCount === inCount) {
                    setCustomers(res.body ? res.body : [])
                }
            })

    }

    const handler = val => {
        setValue(val)
        if (!val) val = {
            id: 0,
            fio: '',
            phone_number: ''
        }
        fields.map(f => props.updateCustomer(f, val[f]))
        setCustomers([])
    }

    return <div
        style={{
            backgroundColor: '#e2f6e2',
            padding: '1rem',
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
            {name: 'phone_number', label: 'Телефон', margin: '1rem .3rem 3rem .3rem'},
            {name: 'fio', label: 'ФИО', margin: '1rem .3rem 2rem .3rem'},
        ].map(f => <Autocomplete
            key={'customerselectkeyincustselect' + f.name + f.label}
            disabled={props.disabled}
            style={{margin: f.margin}}
            fullWidth
            value={value}
            options={customers}
            loading={request.current}
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