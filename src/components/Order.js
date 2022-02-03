import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import {Tab, Tabs, Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import {Print, createDate} from "./common/Print";
import rest from "../components/Rest";
import {upd_app,} from "../actions/actionCreator";
import {bindActionCreators} from "redux";

import {Payments} from "./common/order/Payments";
import {Remarks} from "./common/order/Remarks";
import {Costs} from "./common/order/Costs"
import {Info} from "./common/order/Info";
import {OrderText} from "./common/OrderText"


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

    const [id, setId] = useState(+props.match.params.order_id || null)
    const [stockId, setStockId] = useState(+props.match.params.stock_id || null)
    const [created, setCreated] = useState()

    const needPrint = useRef(false)

    const classes = useStyles()

    const order = props.app.orders
        ? props.app.orders.find(or => or.id === id && or.stock_id === stockId)
        : null

    const canEdit = () => order
        ? order.status_id === 6
            ? new Date() - new Date(order.checkout_date) < 43200000
            : order.status_id < 6
        : false

    const position = props.app.positions.find(p => p.id === props.auth.position_id)
    const isSale = position ? position.is_sale : false

    const doc = props.app.docs.find(d => d.name === 'order')

    const inputToText = elem => {

        const inputs = elem.querySelectorAll('input')

        for (let i of inputs) {

            let span = document.createElement('span')

            const stock = props.app.stocks.find(s => s.id === order.stock_id)

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
                const category = props.app.categories.find(c => c.id === order.category_id)
                value = category ? category.name : ''
            } else if (i.name === 'today') {
                value = createDate(created)
            } else if (i.name === 'created_date') {
                value = createDate(created)
            } else if (i.name === 'fio') {
                value = order.customer.fio || 'ИНКОГНИТО'
            } else if (i.name === 'phone_number') {
                value = order.customer.phone_number ?? 'НЕ УКАЗАН'
            } else if (i.name === 'model') {
                value = order.model || 'НЕИЗВЕСТНО'
            } else if (i.name === 'sum') {
                value = order.sum || 0
            } else if (i.name === 'prepaid') {
                value = order.json.payments[0].sum || 0
            } else if (i.name === 'broken_cost') {
                value = props.app.config.rem_assessed_value
            } else if (props.app.config[i.name]) {
                value = props.app.config[i.name]
            } else if (fields.find(f => f.name === i.name)) {
                value = order[i.name]
            }

            // if (!value) console.log('i.name', i.name)

            span.innerHTML = value || ''

            i.parentNode.replaceChild(span, i)

        }

        return elem
    }

    useEffect(() => {

        if (stockId && id && !order) {

                rest('orders/' + stockId + '/' + id)
                    .then(res => {

                        if (res.status === 200) {

                            props.upd_app({order: res.body})

                        }
                    })

        }

    }, [])

    const setOrder = order => {
        setId(order.id)
        setStockId(order.stock_id)
        setCreated(order.created_at)
    }

    useEffect(() => {

        if (order && needPrint.current) {
                needPrint.current = false
                Print(doc, inputToText)
        }

    }, [order])

    const disabled = !!id

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
                {order
                    ? OrderText(order, props.app) + ' от ' + createDate(created)
                    : 'Новый заказ'}
            </Typography>

            {disabled && <IconButton className={classes.printButton}
                                     onClick={() => Print(doc, inputToText)}
            >
                <PrintIcon/>
            </IconButton>}
        </Grid>

        {order
            ? <Tabs
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
            : null}

        {tabId === 0 &&
        <Info order={order} isEditable={canEdit()} app={props.app} fields={fields}
              isAdmin={props.auth.admin}
              setOrder={setOrder}
              needPrint={needPrint}
        />
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

    </div>
}

export default connect(state => state, mapDispatchToProps)(Order)