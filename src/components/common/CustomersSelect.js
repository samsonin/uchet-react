import React, {useEffect, useRef, useState} from 'react'
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import TableCell from "@material-ui/core/TableCell";
import rest from "../Rest";

const initialValue = []

export default function (props) {

    const {customerId, setCustomerId} = props

    const request = useRef(false)

    const [customers, setCustomers] = useState(initialValue)
    const [value, setValue] = useState('')
    const [fio, setFio] = useState('')
    const [phone, setPhone] = useState('')

    useEffect(() => {

        if (customerId) {
            rest('customers/' + customerId)
                .then(res => {
                    if (res.status === 200 && res.body) {
                        setFio(res.body.fio)
                        setPhone(res.body.phone_number)
                    }
                })
        } else {
            setValue('')
        }

    }, [customerId])

    const handler = (name, reason) => {

        if (reason !== 'input' || name.length < 4 || request.current) return

        request.current = true;

        rest('customers?all=' + name)
            .then(res => {
                if (res.ok) {
                    setCustomers(res.body ? res.body : initialValue)
                }
                request.current = false;
            })

    }


    return <Autocomplete
        value={value}
        options={customers}
        loading={request.current}
        onInputChange={(e, v, r) => handler(v, r)}
        onChange={(e, v) => setValue(v)}
        getOptionLabel={option => option ? option.fio + ' ' + option.phone_number : ''}
        getOptionSelected={option => option.name}
        renderInput={params => <TextField {...params} label="Заказчик"/>}
    />

}