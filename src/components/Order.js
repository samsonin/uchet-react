import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import {Tab, Tabs, Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

import {Print, createDate} from "./common/Print";
import rest from "../components/Rest";

import {Payments} from "./common/order/Payments";
import {Remarks} from "./common/order/Remarks";
import {Costs} from "./common/order/Costs"
import Info from "./common/order/Info";
import {OrderText} from "./common/OrderText"
import {totalSum} from "./common/order/functions";


const useStyles = makeStyles(() => ({
    printButton: {
        right: '4rem',
    }
}))


const Order = props => {

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

    const docName = order && order.status_id === 6 ? 'order_checkout' : 'order'

    const doc = props.app.docs.find(d => d.name === docName)

    const category = order ? props.app.categories.find(c => c.id === order.category_id) : null

    const stock = order ? props.app.stocks.find(s => s.id === order.stock_id) : null

    const alias = order
        ? {
            organization_organization: props.app.organization.organization,
            organization_legal_address: props.app.organization.legal_address,
            organization_inn: props.app.organization.inn,
            organization_ogrn: props.app.organization.ogrn,
            access_point_address: stock.address,
            access_point_phone_number: stock.phone_number,
            id: id,
            group: category ? category.name : '',
            fio: order.customer
                ? order.customer.fio || 'ИНКОГНИТО'
                : '',
            phone_number: order.customer
                ? order.customer.phone_number || 'НЕ УКАЗАН'
                : '',
            model: order.model || 'НЕИЗВЕСТНО',
            sum: order.sum || 0,
            sum2: totalSum(order),
            imei: order.imei || '',
            for_client: order.for_client || '',
            prepaid: order.json && order.json.payments && order.json.payments[0]
                ? order.json.payments[0].sum || 0
                : 0,
            broken_cost: props.app.config.rem_assessed_value,

            today: createDate(created),
            created_date: createDate(created),

        }
        : {}

    const aliasFunction = name => {

        let value
        if (props.app.config[name]) {
            value = props.app.config[name]
        } else if (props.app.fields.allElements
            .filter(f => f.index === 'order' && f.is_valid && !f.is_system)
            .find(f => f.name === name)) {
            value = order[name]
        }

        return value

    }

    useEffect(() => {

        if (stockId && id && !order) {

            rest('orders/' + stockId + '/' + id)

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

            let url = '/order'
            if (order.stock_id && order.id) url += '/' + order.stock_id + '/' + order.id

            props.history.push(url)

            Print(doc, alias, aliasFunction)

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
                    ? order.id && order.stock_id
                        ? OrderText(order, props.app) + ' от ' + createDate(order.time)
                        : 'Гарантийный заказ'
                    : 'Новый заказ'}
            </Typography>

            {disabled && order && <IconButton className={classes.printButton}
                                              onClick={() => Print(doc, alias, aliasFunction)}
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
            <Info order={order}
                  setOrder={setOrder}
                  isEditable={canEdit()}
                  needPrint={needPrint}
            />
        }

        {order && tabId === 1 &&
            <Costs order={order}
                   isEditable={canEdit()}
                   users={props.app.users}
                   providers={props.app.providers}
            />
        }

        {order && tabId === 2 &&
            <Payments order={order}
                      isEditable={canEdit() && isSale}
            />
        }

        {order && tabId === 3 &&
            <Remarks order={order}
                     users={props.app.users}
            />
        }

    </div>
}

export default connect(state => state)(Order)