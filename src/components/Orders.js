import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {useSnackbar} from "notistack";

import rest from "../components/Rest"
import CustomersSelect from "../components/common/CustomersSelect"
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time"
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import StatusesSelect from "./common/StatusesSelect";

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
    const [masterId, setMasterId] = useState(0)
    const [statusId, setStatusId] = useState(-1)

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

    useEffect(() => {

        rest('orders/all')
            .then(res => {
                if (res.status === 200) {
                    setOrders(res.body)
                }
            })

    }, [])

    useEffect(() => {

    if (props.enterPress) find()
// eslint-disable-next-line
    }, [props.enterPress])

    const find = () => {

        let url = 'orders?'

        if (stocks) stocks.map(s => {
            if (s) url += 'stock_ids[]=' + s + '&'
        })

        if (masterId) url += 'master_id=' + masterId + '&'

        if (statusId >= 0) url += 'status_id=' + statusId + '&'

        if (id) url += 'id=' + id
        else if (customer.id) url += 'customer_id=' + customer.id
        else if (createdDate || createdDate2 || checkoutDate || checkoutDate2) {

            ['createdDate', 'createdDate2', 'checkoutDate', 'checkoutDate2'].map(v => {
                if (eval(v)) url += v + '=' + eval(v) + '&'
            })

        }

        if (!url) url = position && position.is_sale && props.app.stock_id
            ? 'orders?current_shift_only&stock_ids[]=' + props.app.stock_id
            : 'allowedOrders'

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

    const changeSearchParameters = () => {

        setId(0)
        setCustomer(initCustomer)
        setCreatedDate()
        setCreatedDate2()
        setCheckoutDate()
        setCheckoutDate2()
        setMasterId(0)

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
                {onlyMy
                    ? <TextField
                        className={"m-2 p-2"}
                        label={"Заказ №"}
                        value={id ? id.toString() : ''}
                        onChange={e => intInputHandler(e.target.value, setId)}
                    />
                    : null}

                <IconButton
                    onClick={() => changeSearchParameters()}
                >
                    {onlyMy
                        ? <KeyboardArrowRightIcon/>
                        : <KeyboardArrowLeftIcon/>}
                </IconButton>

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
                        onChange={e => setCheckoutDate2(e.target.value)}
                    />
                </Grid>

                <UsersSelect
                    user={masterId}
                    users={props.app.users}
                    setUser={setMasterId}
                    onlyValid
                    classes={"w-100 p-1 m-1"}
                    label={"Мастер"}
                />

                <StatusesSelect
                    status={statusId}
                    statuses={props.app.statuses}
                    setStatus={setStatusId}
                    empty
                />

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
                    <TableCell>#</TableCell>
                    <TableCell>Дата, время</TableCell>
                    <TableCell>Устройство</TableCell>
                    <TableCell>Заказчик</TableCell>
                    <TableCell>Статус</TableCell>
                    {onlyMy ? null : <TableCell>Мастер</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {orders && orders.map(o => {

                    const status = props.app.statuses.find(s => s.id === o.status_id)

                    const master = props.app.users.find(u => u.id === o.master_id)

                    return <TableRow
                        style={{
                            backgroundColor: status ? '#' + status.color : '#fff',
                            cursor: 'pointer'
                        }}
                        key={'ordertablerowkeyinorders' + o.stock_id + (o.id || o.order_id)}
                        onClick={() => props.history.push('/order/' + o.stock_id + '/' + (o.id || o.order_id))}
                    >
                        <TableCell>
                            {renderOrderText(o)}
                        </TableCell>
                        <TableCell>
                            {toLocalTimeStr(o.created_at)}
                        </TableCell>
                        <TableCell>
                            {o.model}
                        </TableCell>
                        <TableCell>
                            {o.customer
                                ? TwoLineInCell(o.customer.phone_number, o.customer.fio)
                                : 'не определен'}
                        </TableCell>
                        <TableCell color={status.color}>
                            {status.name}
                        </TableCell>
                        {onlyMy || <TableCell>
                            {master ? master.name : 'не определен'}
                        </TableCell>}
                    </TableRow>
                })}
            </TableBody>
        </Table>

    </div>

}

export default connect(state => state)(Orders)