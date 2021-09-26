import React, {useEffect, useRef, useState} from 'react'
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import rest from "../Rest";


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

        props.updateCustomer(name, val)

        if (val.length < 4 || request.current) return

        request.current = true;

        rest('customers?all=' + val)
            .then(res => {
                if (res.ok) {
                    setCustomers(res.body ? res.body : [])
                }
                request.current = false;
            })

    }

    const handler = val => {
        setValue(val)
        setCustomers([])
    }

    return <>
        {[
            {name: 'phone_number', label: 'Телефон заказчика', margin: '1rem .3rem 3rem .3rem'},
            {name: 'fio', label: 'ФИО заказчика', margin: '1rem .3rem 2rem .3rem'},
        ].map(f => <Autocomplete
            key={'customerselectkeyincustselect' + f.label}
            style={{
                margin: f.margin,
                width: '100%'
            }}
            value={value}
            options={customers}
            loading={request.current}
            onInputChange={(e, v, r) => handlerInput(v, r, f.name)}
            onChange={(e, v) => handler(v)}
            getOptionLabel={option => option ? option[f.name] || '' : ''}
            getOptionSelected={option => option.id === props.customer.id}
            renderInput={params => <TextField {...params} label={f.label}/>}
        />)}
    </>
}