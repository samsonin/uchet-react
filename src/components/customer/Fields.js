import React, {useRef, useState} from "react";
import {connect} from "react-redux";

import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import TextField from "@material-ui/core/TextField/TextField";
import {Autocomplete} from "@material-ui/lab";
import rest from "../Rest";

const types = {
    birthday: 'date',
    doc_date: 'date',
}

let outCount = 0
let inCount = 0

const Fields = props => {

    const request = useRef(false)

    const [isDetails, setIsDetails] = useState(!props.customer.id)
    const [customers, setCustomers] = useState([])

    const handler = (name, val) => {

        if (name === 'phone_number') val = val.replace(/[^0-9]/g, "")
        if (name === 'fio') val = val.replace(/[^a-zA-Zа-яёА-ЯЁ ]/g, "")
            .split(' ')
            .map(w => w.substring(0, 1).toUpperCase() + w.substring(1).toLowerCase())
            .join(' ')

        props.handleChange(name, val)

    }

    const onInputChangeAutocomplete = (value, reason, name) => {

        if (reason !== 'input') return

        handler(name, value)

        if (value.length < 6) return

        request.current = true;
        outCount++

        rest('customers?details=1&all=' + value)
            .then(res => {
                request.current = false;
                inCount++
                if (res.ok && outCount === inCount) {
                    setCustomers(res.body || [])
                }
            })


    }

    const onChangeAutocomplete = (value, reason, name) => {

        if (reason === 'clear') {
            props.setCustomer({})
        }

        if (reason !== 'select-option') return

        props.setCustomer(value)

    }

    return <div style={{
        backgroundColor: '#e2f6e2',
        margin: '.3rem',
    }}>

        <div style={{
            margin: '.1rem',
            padding: '.1rem',
            display: "flex",
            justifyContent: 'space-between',
        }}>

            <span style={{
                margin: '1rem',
                fontWeight: 'bold'
            }}>
                {props.customer.id ? 'Клиент из базы' : 'Новый клиент'}
            </span>

            <Tooltip title={isDetails ? 'Короче' : 'Подробнее'}>
                <IconButton
                    onClick={() => setIsDetails(!isDetails)}
                >
                    {isDetails ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                </IconButton>
            </Tooltip>

        </div>

        {props.allElements
            .filter(field => field.index === 'customer' && field.is_valid)
            .filter(field => isDetails || ['fio', 'phone_number'].includes(field.name))
            .map(field => ['fio', 'phone_number'].includes(field.name)

                    ? <Autocomplete
                        key={'customer-fields-key' + field.name + field.index + field.value}
                        style={props.fieldsStyle}
                        fullWidth
                        inputValue={props.customer[field.name] ?? ''}
                        options={customers}
                        loading={request.current}
                        onInputChange={(e, v, r) => {
                            onInputChangeAutocomplete(v, r, field.name)
                        }}
                        onChange={(e, v, r) => {
                            onChangeAutocomplete(v, r, field.name)
                        }}
                        getOptionLabel={option => option ? option[field.name] : ''}
                        getOptionSelected={option => option.id === props.customer.id}
                        renderInput={params => <TextField
                            {...params}
                            label={field.value}
                        />}
                    />

                : <TextField
                        style={props.fieldsStyle}
                        key={'customer-fields-key' + field.name + field.index + field.value}
                        type={types[field.name] || 'text'}
                        label={field.value}
                        value={props.customer[field.name] || ''}
                        onChange={e => handler(field.name, e.target.value)}
                    />

            )}

    </div>

}

export default connect(state => state.app.fields)(Fields);