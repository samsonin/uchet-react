import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import TextField from "@material-ui/core/TextField/TextField";
import CustomersSelect from "./common/CustomersSelect";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import {Tab, Tabs, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

import {Print, createDate} from "./common/Print";
import rest from "../components/Rest";
import {useSnackbar} from "notistack";
import {upd_app,} from "../actions/actionCreator";
import {bindActionCreators} from "redux";

import {Payments} from "./common/order/Payments";
import {Remarks} from "./common/order/Remarks";
import {Costs} from "./common/order/Costs"
import {Info} from "./common/order/Info";


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

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

const Order = props => {

    const fields = props.app.fields.allElements.filter(f => f.index === 'order' && f.is_valid && !f.is_system)

    const [tabId, setTabId] = useState(0)
    const [id, setId] = useState(+props.match.params.id || null)
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

    const needPrint = useRef(false)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const stockId = +props.match.params.stock_id
    const orderId = +props.match.params.order_id
    const order = props.app.orders
        ? props.app.orders.find(or => or.id === orderId && or.stock_id === stockId)
        : null

    const canEdit = () => order
        ? order.status_id === 6
            ? new Date() - new Date(order.checkout_date) < 43200000
            : order.status_id < 6
        : false

    const updCurrentOrder = order => {

        setId(order.id)
        setCreated(order.time)
        setCustomer(order.customer)
        setModel(order.model)
        setPresum(order.preSum)
        setSum(order.sum)

    }

    const position = props.app.positions.find(p => p.id === props.auth.position_id)
    const isSale = position ? position.is_sale : false

    const doc = props.app.docs.find(d => d.name === 'order')

    const inputToText = elem => {

        const inputs = elem.querySelectorAll('input')

        for (let i of inputs) {

            let span = document.createElement('span')

            const stock = props.app.stocks.find(s => s.id === props.app.stock_id)

            let value
            if (i.name === 'organization_organization') {
                value = props.app.organization.organization
            } else if (i.name === 'organization_legal_address') {
                value = props.app.organization.legal_address
            } else if (i.name === 'organization_inn') {
                value = props.app.organization.inn
            } else if (i.name === 'organization_ogrn') {
                value = props.app.organization.ogrn
            } else if (i.name === 'access_point_address') {
                value = stock ? stock.address : ''
            } else if (i.name === 'access_point_phone_number') {
                value = stock ? stock.phone_number : ''
            } else if (i.name === 'id') {
                value = id
            } else if (i.name === 'group') {
                const category = props.app.categories.find(c => c.id === categoryId)
                value = category ? category.name : ''
            } else if (i.name === 'today') {
                value = createDate(created)
            } else if (i.name === 'fio') {
                value = customer.fio || 'ИНКОГНИТО'
            } else if (i.name === 'phone_number') {
                value = customer.phone_number ?? 'НЕ УКАЗАН'
            } else if (i.name === 'model') {
                value = model || 'НЕИЗВЕСТНО'
            } else if (i.name === 'sum') {
                value = sum || 0
            } else if (i.name === 'prepaid') {
                value = presum || 0
            } else if (i.name === 'broken_cost') {
                value = props.app.config.rem_assessed_value
            } else if (props.app.config[i.name]) {
                value = props.app.config[i.name]
            } else if (fields.find(f => f.name === i.name)) {
                value = state[i.name]
            }

            // if (!value) console.log('i.name', i.name)

            span.innerHTML = value || ''

            i.parentNode.replaceChild(span, i)

        }

        return elem
    }

    useEffect(() => {

        if (stockId && orderId) {

            if (order) {

                updCurrentOrder(order)

            } else {

                rest('orders/' + stockId + '/' + orderId)
                    .then(res => {

                        if (res.status === 200) {

                            props.upd_app({order: res.body})

                            return updCurrentOrder(res.body)

                        }
                    })

            }


        }

    }, [])

    useEffect(() => {

        if (id && needPrint.current) {
            needPrint.current = false
            Print(doc, inputToText)
        }

    }, [id])

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

                if (res.status === 200) {

                    needPrint.current = true
                    setId(res.body.orders[0].id)

                }
            })


    }

    const setField = (name, value) => {

        setState(prev => {

            const newState = {...prev}
            newState[name] = value
            return newState

        })

    }

    const disabled = !!id

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

            {disabled && <IconButton className={classes.printButton}
                                     onClick={() => Print(doc, inputToText)}
            >
                <PrintIcon/>
            </IconButton>}
        </Grid>

        {!id
            ? <>

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
                    disabled={disabled}
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
                           disabled={disabled}
                />

                <TextField label="Предварительная стоимость"
                           disabled={disabled}
                           style={fieldsStyle}
                           value={sum}
                           onChange={e => setSum(+e.target.value)}
                />

                <TextField label="Предоплата при оформлении заказа"
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

                {disabled || <Button variant='outlined'
                                     onClick={() => create()}
                                     color="primary">
                    Внести
                </Button>}

            </>
            : <>

                <Tabs
                    value={tabId}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, v) => setTabId(v)}
                    style={{
                        margin: '1rem'
                    }}
                >
                    <Tab label="Информация"/>
                    <Tab label="Затраты"/>
                    <Tab label="Платежи"/>
                    <Tab label="Процесс"/>
                </Tabs>

                {order && tabId === 0 &&
                    <Info order={order} isEditable={canEdit()} app={props.app} fields={fields}/>
                }

                {order && tabId === 1 &&
                    <Costs order={order} isEditable={canEdit()} users={props.app.users}
                           providers={props.app.providers}/>
                }

                {order && tabId === 2 &&
                    <Payments order={order} isEditable={canEdit() && isSale}/>
                }

                {order && tabId === 3 &&
                    <Remarks order={order} isEditable={canEdit()} users={props.app.users}/>
                }

            </>}

    </div>
}

export default connect(state => state, mapDispatchToProps)(Order)