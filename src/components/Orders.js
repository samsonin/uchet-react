import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import rest from "../components/Rest"
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import CustomersSelect from "../components/common/CustomersSelect"
import {useSnackbar} from "notistack";

const initCustomer = {
    id: 0,
    fio: '',
    phone_number: ''
}

const Orders = props => {

    const [onlyMy, setOnlyMy] = useState(true)

    const [stocks, setStocks] = useState(() => [props.app.stock_id])

    const [id, setId] = useState(0)
    const [customer, setCustomer] = useState(initCustomer)
    const [createdDate, setCreatedDate] = useState()
    const [createdDate2, setCreatedDate2] = useState()
    const [checkoutDate, setCheckoutDate] = useState()
    const [checkoutDate2, setCheckoutDate2] = useState()

    const [orders, setOrders] = useState()

    const {enqueueSnackbar} = useSnackbar()

    const position = props.app.positions.find(p => p.id === props.auth.position_id)

    const handleStocks = (stockId, checked) => {

        setStocks(prev => {

            if (checked) {

                let nextStocks = [...prev]
                nextStocks.push(stockId)
                return nextStocks

            } else {

                return prev.filter(s => s !== stockId)

            }
        })
    }

    const getUrl = () => position && position.is_sale && props.app.stock_id
        ? 'orders?current_shift_only&stock_ids[]=' + props.app.stock_id
        : 'allowedOrders'

    useEffect(() => {

        console.log('stocks', stocks)

    }, [stocks])

    useEffect(() => {

        rest(getUrl())
            .then(res => {
                if (res.status === 200) {
                    setOrders(res.body)
                }
            })

    }, [])

    const handleOrder = (i, val) => {

    }

    useEffect(() => {

        if (props.enterPress) find()
// eslint-disable-next-line
    }, [props.enterPress])

    const find = () => {

        let url = 'orders?'

        if (stocks) stocks.map(v => {
            if (v) url += 'stock_ids[]=' + v + '&'
        })

        if (id) url += 'id=' + id
        else if (customer.id) url += 'customer_id=' + customer.id
        else if (createdDate || createdDate2 || checkoutDate || checkoutDate2) {

            ['createdDate', 'createdDate2', 'checkoutDate', 'checkoutDate2'].map(v => {
                if (eval(v)) url += v + '=' + eval(v) + '&'
            })

        } else url = getUrl()

        rest(url)
            .then(res => {
                if (res.status === 200) {

                    setOrders(res.body)

                } else if (res.status === 204) {

                    enqueueSnackbar('Заказов не найдено', {variant: 'error'})

                }
            })

    }

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }

    const openOrder = (stock_id, id) => {

        props.history.push('/order/' + stock_id + '/' + id)

    }

    const changeSearchParameters = () => {

        setId(0)
        setCustomer(initCustomer)
        setCreatedDate()
        setCreatedDate2()
        setCheckoutDate()
        setCheckoutDate2()

        setOnlyMy(!onlyMy)

    }

    const renderOrderText = ({id, order_id, stock_id}) => {

        const i = order_id || id

        const stock = props.app && props.app.stocks.find(s => s.id === stock_id)

        return props.app.stock_id === stock_id
            ? i
            : stock
                ? stock.name + ', ' + i
                : 'точка не определена, ' + i
    }

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >
        <Grid container
              justify='space-between'
        >
            <TextField
                key={"idonordersseachr3"}
                className={"m-2 p-2"}
                label={"Заказ №"}
                value={id ? id.toString() : ''}
                onChange={e => setId(+e.target.value)}
            />

            {<IconButton
                onClick={() => changeSearchParameters()}
            >
                {onlyMy
                    ? <KeyboardArrowRightIcon/>
                    : <KeyboardArrowLeftIcon/>}
            </IconButton>}

        </Grid>

        {!id && onlyMy && <CustomersSelect
            customer={customer}
            updateCustomer={updateCustomer}
            onlySearch={true}
        />}

        {onlyMy || <>
            <Grid item className="w-100 m-2 p-2">

                {props.app.stocks.map(s => s.is_valid
                    ? <FormControlLabel
                        key={'formcntrinordersstocks' + s.id}
                        control={<Checkbox
                            color="primary"
                            key={'stocksonordersseach' + s.id}
                            checked={stocks.includes(s.id)}
                            onChange={e => handleStocks(s.id, e.target.checked)}
                        />}
                        label={s.name}
                    />
                    : null
                )}

            </Grid>

            <Grid item className="w-100 m-2 p-2">
                Заказ создан с
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={createdDate}
                    onChange={e => setCreatedDate(e.target.value)}
                />
                по
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={createdDate2}
                    onChange={e => setCreatedDate2(e.target.value)}
                />
            </Grid>

            <Grid item className="w-100 m-2 p-2">
                Заказ закрыт с
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={checkoutDate}
                    onChange={e => setCheckoutDate(e.target.value)}
                />
                по
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={checkoutDate2}
                    onChange={e => handleOrder('dateOfCheckout2', e.target.value)}
                />
            </Grid>
        </>}

        <Grid container
              justify={'flex-end'}
        >

            <Button
                style={{
                    margin: '1rem'
                }}
                onClick={() => find()}
                color={'primary'}
                variant='outlined'
            >
                Найти
            </Button>

        </Grid>

        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>Устройство</TableCell>
                    <TableCell>Заказчик</TableCell>
                    <TableCell>Статус</TableCell>
                    {onlyMy ? null : <TableCell>Мастер</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {orders && orders.map(o => {

                    const status = props.app.statuses.find(s => s.id === o.status_id)

                    return <TableRow
                        style={{
                            backgroundColor: status ? '#' + status.color : '#fff',
                            cursor: 'pointer'
                        }}
                        key={'ordertablerowkeyinorders' + o.stock_id + o.order_id}
                        onClick={() => openOrder(o.stock_id, o.order_id || o.id)}
                    >
                        <TableCell>
                            {o.created_at}
                        </TableCell>
                        <TableCell>
                            {renderOrderText(o)}
                        </TableCell>
                        <TableCell>
                            {o.model}
                        </TableCell>
                        {o.customer
                            ? <TableCell>
                                <span className="font-weight-bold">{o.customer.phone_number}</span>
                                <br/>
                                {o.customer.fio}
                            </TableCell>
                            : o.customer_id
                                ? 'не идентифицирован'
                                : 'не определен'}
                        <TableCell color={status.color}>
                            {status.name}
                        </TableCell>
                        {onlyMy || <TableCell>
                            {o.master_id}
                        </TableCell>}
                    </TableRow>
                })}
            </TableBody>
        </Table>

    </div>

}

export default connect(state => state)(Orders)