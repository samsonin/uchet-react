import React, {useRef, useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {Grid, Paper} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import DeleteIcon from "@material-ui/icons/Delete";

import ReferalSelect from "../ReferalSelect";
import {BottomButtons} from "../common/BottomButtons";
import TextField from "@material-ui/core/TextField/TextField";
import {Autocomplete} from "@material-ui/lab";

const types = {
    birthday: 'date',
    doc_date: 'date',
}

const Fields = props => {

    console.log(props.customer)

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

    const handlerInput = (v, r, name) => {

        console.log(v, r, name)

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
                    value={props.customer[field.name] || ''}
                    options={customers}
                    loading={request.current}
                    onInputChange={(e, v, r) => handlerInput(v, r, field.name)}
                    onChange={(e, v) => handler(v)}
                    getOptionLabel={option => option ? option[field.name] || '' : ''}
                    getOptionSelected={option => option.id === props.customer.id}
                    renderInput={params => <TextField
                        {...params}
                        autoComplete='off'
                        label={field.value}
                        id={'customer-select-key-in-custselect' + field.name + field.label}
                        name={'customer-select-key-in-custselect' + field.name + field.label}
                    />}
                />
                : <TextField
                    style={props.fieldsStyle}
                    key={'customer-fields-key' + field.name + field.index + field.value}
                    type={types[field.name] || 'text'}
                    label={field.value}
                    value={props.customer[field.name] || ''}
                    onChange={e => handler(field.name, e.target.value)}
                />)}

    </div>

}

export default connect(state => state.app.fields)(Fields);
