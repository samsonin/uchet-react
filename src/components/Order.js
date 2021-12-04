import React, {useState} from "react";
import {connect} from "react-redux";
import TextField from "@material-ui/core/TextField/TextField";
import CustomersSelect from "./common/CustomersSelect";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import {Print, createDate} from "./common/Print";
import rest from "../components/Rest";
import {enqueueSnackbar} from "../actions/actionCreator";
import {useSnackbar} from "notistack";


const initCustomer = {
    id: 0,
    phone_number: '',
    fio: '',
}

const fieldsStyle = {
    margin: '1rem .3rem',
    width: '100%'
}

const useStyles = makeStyles(() => ({
    printButton: {
        right: '4rem',
    }
}))


const Order = props => {

    const fields = props.app.fields.allElements.filter(f => f.index === 'order' && f.is_valid && !f.is_system)

    const [id, setId] = useState()
    const [created, setCreated] = useState()
    const [customer, setCustomer] = useState(initCustomer)
    const [model, setModel] = useState('')
    const [presum, setPresum] = useState(0)
    const [sum, setSum] = useState(0)
    const [state, setState] = useState(() => {
        let state = {}
        fields.map(f => {
            state[f.name] = ''
        })
        return state
    })
    const [categoryId, setCategoryId] = useState(5)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const doc = props.app.docs.find(d => d.name === 'remont')

    const inputToText = elem => {

        const inputs = elem.querySelectorAll('input')

        for (let i of inputs) {

            let span = document.createElement('span')

            let value
            if (i.name === 'organization_organization') {
                value = props.app.organization.organization
            } else if (i.name === 'organization_inn') {
                value = props.app.organization.inn
            } else if (i.name === 'today') {
                value = createDate()
            } else if (i.name === 'fio') {
                value = customer.fio
            } else if (i.name === 'model') {
                value = model
            } else if (i.name === 'sum') {
                value = sum
            } else if (i.name === 'presum') {
                value = presum
            }

            if (!value) {
                console.log('i.name', i.name)
            }

            span.innerHTML = value

            i.parentNode.replaceChild(span, i)

        }

        return elem
    }

    const create = () => {

        if (!props.app.stock_id) return enqueueSnackbar('Выберите точку', {variant: 'error'})
        if (!(customer.id || customer.fio || customer.phone_number)) {
            return enqueueSnackbar('Нет заказчика', {variant: 'error'})
        }
        if (!model) return enqueueSnackbar('Не указана модель', {variant: 'error'})


        const data = {
            customer,
            category_id: categoryId,
            model,
            presum,
            sum,
            ...state
        }

        rest('orders/' + props.app.stock_id, 'POST', data)
            .then(res => {



            })

        Print(doc, inputToText)

    }

    const setField = (name, value) => {

        setState(prev => {

            const newState = {...prev}
            newState[name] = value
            return newState

        })

    }

    const disabled = false

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        <Grid container
              justify="space-between"
        >

            <Typography variant="h6"
                        style={{
                            margin: '.8rem',
                        }}
            >
                {id ? '#' + id + ' от ' + createDate(created) : 'Новый заказ'}
            </Typography>

            {id
            ? <IconButton className={classes.printButton}
                                onClick={() => Print(doc, inputToText)}
            >
                <PrintIcon/>
            </IconButton>
            : null}
        </Grid>

        <CustomersSelect
            customer={customer}
            disabled={disabled}
            updateCustomer={updateCustomer}
        />

        <Select
            labelId="category-id-select-label"
            value={categoryId}
            onChange={e => setCategoryId(+e.target.value)}
            style={fieldsStyle}
        >
            {[5, 38, 41, 2].map(i => {

                const category = props.app.categories.find(c => c.id === i)

                return <MenuItem
                    key={'menu-category-key-' + i}
                    value={i}>
                    {category ? category.name : ''}
                </MenuItem>

            })}
        </Select>

        <TextField label="Модель телефона, планшета, ноутбука или другого устройства"
                   style={fieldsStyle}
                   value={model}
                   onChange={e => setModel(e.target.value)}
        />

        <TextField label="Предварительная стоимость"
                   disabled={disabled}
                   style={fieldsStyle}
                   value={sum}
                   onChange={e => setSum(+e.target.value)}
        />

        <TextField label="Предоплата при оформлении заказа"
                   disabled={disabled}
                   style={fieldsStyle}
                   value={presum}
                   onChange={e => setPresum(+e.target.value)}
        />

        {fields.map(f => <TextField label={f.value}
                                    key={'text-fields-in-new-order' + f.name}
                                    disabled={disabled}
                                    style={fieldsStyle}
                                    value={state[f.name]}
                                    onChange={e => setField([f.name], e.target.value)}
        />)}

        <Button variant='outlined'
                onClick={() => create()}
                color="primary">
            {id ? 'Сохранить' : 'Внести'}
        </Button>

    </div>
}

export default connect(state => state)(Order)