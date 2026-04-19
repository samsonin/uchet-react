import React, {useEffect, useRef, useState} from 'react';
import {connect} from "react-redux";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {useSnackbar} from "notistack";

import rest from "../components/Rest"
import CustomersSelect from "../components/common/CustomersSelect"
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time"
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import StatusesSelect from "./common/StatusesSelect";
import {OrderText} from "./common/OrderText"
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";

const mainUrl = document.location.protocol + '//' + document.location.host

const initCustomer = {
    id: 0,
    fio: '',
    phone_number: ''
}

const getContrastText = color => {
    const hex = String(color || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#ffffff';

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#16303a' : '#ffffff';
}

const Orders = props => {

    const appStocks = props.app.stocks || []
    const appPositions = props.app.positions || []
    const appStatuses = props.app.statuses || []

    const [parameters, setParameters] = useState(false)

    const [stocks, setStocks] = useState(() => appStocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))

    const [id, setId] = useState(0)
    const [customer, setCustomer] = useState(initCustomer)
    const [createdDate, setCreatedDate] = useState()
    const [createdDate2, setCreatedDate2] = useState()
    const [checkoutDate, setCheckoutDate] = useState()
    const [checkoutDate2, setCheckoutDate2] = useState()
    const [masterId, setMasterId] = useState(0)
    const [statusId, setStatusId] = useState(-1)
    const [model, setModel] = useState()
    const [imei, setImei] = useState()

    const [hideFinished, setHideFinished] = useState(false)

    const [orders, setOrders] = useState()

    const {enqueueSnackbar} = useSnackbar()

    const inputRef = useRef();

    const position = appPositions.find(p => p.id === props.auth.position_id)

    const afterRest = res => {

        if (res.status === 200) {

            setParameters(false)
            setOrders(res.body)

        } else if (res.status === 204) {

            enqueueSnackbar('Заказов не найдено', {variant: 'error'})

        }

    }

    useEffect(() => {

        if (inputRef.current) inputRef.current.focus();

        let url = 'orders/all'

        if (props.auth.organization_id === 1 && props.app.current_stock_id) url += '/' + props.app.current_stock_id

        rest(url)
            .then(res => {
                if (res.status === 200) {
                    setOrders(res.body)
                }
            })

    }, [])

    useEffect(() => {

        if (props.enterPress) find()

        props.setEnterPress(false)

// eslint-disable-next-line
    }, [props.enterPress])

    const find = () => {

        let url = 'orders?'

        if (stocks) stocks.map(s => {
            if (s) url += 'stock_ids[]=' + s + '&'
            return s
        })

        if (masterId) url += 'master_id=' + masterId + '&'

        if (statusId >= 0) url += 'status_id=' + statusId + '&'

        if (model) url += 'model=' + model + '&'
        if (imei) url += 'imei=' + imei + '&'

        if (id) url = 'orders?id=' + id
        else if (customer.id) url = 'orders?customer_id=' + customer.id
        else if (customer.fio || customer.phone_number) {
            url = 'orders?fio=' + customer.fio + '&phone_number=' + customer.phone_number
        } else if (createdDate || createdDate2 || checkoutDate || checkoutDate2) {

            ['createdDate', 'createdDate2', 'checkoutDate', 'checkoutDate2'].map(v => {
                if (eval(v)) url += v + '=' + eval(v) + '&'
                return v
            })

        }

        if (!url) url = position && position.is_sale && props.app.current_stock_id
            ? 'orders?current_shift_only&stock_ids[]=' + props.app.current_stock_id
            : 'allowedOrders'

        rest(url)
            .then(res => afterRest(res))

    }

    const getMy = () => rest('allowedOrders')
        .then(res => afterRest(res))

    const renderStatus = (stock_id, order_id, status_id) => {

        const status = appStatuses.find(s => s.id === status_id)
        const statusColor = status ? '#' + status.color : 'var(--surface-soft)'
        const statusTextColor = status ? getContrastText(status.color) : 'var(--text)'

        return status
            ? <div
                className="order-status-pill"
                style={{
                    backgroundColor: statusColor,
                    color: statusTextColor,
                }}
            >
                {status.name}
            </div>
            : null

    }

    const findButton = () => <Button
        className="orders-action-button"
        onClick={() => find()}
        color={'primary'}
        variant='outlined'
    >
        Найти
    </Button>

    return <div className="orders-page">

        <div className="orders-toolbar">

            <TextField
                className="orders-id-field"
                label={"Заказ №"}
                value={id ? id.toString() : ''}
                onChange={e => intInputHandler(e.target.value, setId)}
                inputRef={inputRef}
            />

            {parameters || findButton()}

        </div>

        <Button
                className="orders-secondary-button"
                variant="outlined"
                size="small"
                onClick={() => setParameters(!parameters)}
        >
            Параметры поиска
        </Button>

        <Button
                className="orders-secondary-button"
                variant="outlined"
                size="small"
                onClick={() => getMy()}
        >
            Мои текущие
        </Button>

        {parameters && <>

            {!id && <CustomersSelect
                customer={customer}
                setCustomer={setCustomer}
                onlySearch={true}
            />}

            {!id && !(customer.id || customer.fio || customer.phone_number) && <>
                <div className="w-100 m-2 p-2">

                    <StocksCheck stocks={stocks} setStocks={setStocks}/>

                </div>

                <DateInterval
                    label="Заказ создан"
                    date1={createdDate}
                    date2={createdDate2}
                    setDate1={setCreatedDate}
                    setDate2={setCreatedDate2}
                />

                <DateInterval
                    label="Заказ закрыт"
                    date1={checkoutDate}
                    date2={checkoutDate2}
                    setDate1={setCheckoutDate}
                    setDate2={setCheckoutDate2}
                />

                <UsersSelect
                    user={masterId}
                    users={props.app.users}
                    setUser={setMasterId}
                    onlyValid
                    classes="w-100 p-1 m-1"
                    label="Мастер"
                />

                <StatusesSelect
                    status={statusId}
                    setStatus={setStatusId}
                    empty
                />

                <TextField
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-100 p-1 m-1"
                    label="Модель устройства"
                />

                <TextField
                    value={imei}
                    onChange={e => setImei(e.target.value)}
                    className="w-100 p-1 m-1"
                    label="Серийный номер, imei"
                />

            </>}

            {findButton()}

        </>}

        <div className="orders-inline-actions">

            <FormControlLabel
                control={
                    <Checkbox
                        checked={hideFinished}
                        onChange={() => setHideFinished(!hideFinished)}
                        color="primary"
                    />
                }
                label="скрыть завершенные"
            />

            {/*<TextField style={{*/}
            {/*    margin: '1rem',*/}
            {/*}}*/}
            {/*           InputProps={{*/}
            {/*               startAdornment: (*/}
            {/*                   <InputAdornment position="start">*/}
            {/*                       <SearchIcon/>*/}
            {/*                   </InputAdornment>*/}
            {/*               ),*/}
            {/*           }}*/}
            {/*           value={search}*/}
            {/*           onChange={e => setSearch(e.target.value)}*/}
            {/*/>*/}


        </div>

        <Table size="small" className="orders-table">
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Дата, время</TableCell>
                    <TableCell>Устройство</TableCell>
                    <TableCell>Заказчик</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Мастер</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {orders && orders.filter(o => !hideFinished || o.status_id < 6)
                    .map(o => {

                        const master = (props.app.users || []).find(u => u.id === o.master_id)

                        const color = o.defect && o.defect.indexOf('Технический осмотр') === 0
                            ? 'blue'
                            : 'black'

                        return <TableRow
                            style={{
                                cursor: 'pointer',
                            }}
                            key={'ordertablerowkeyinorders' + o.stock_id + (o.id || o.order_id)}
                            onClick={() => window
                                .open(mainUrl + '/order/' + o.stock_id + '/' + (o.id || o.order_id), "_blank")}
                        >
                            <TableCell style={{color}}>
                                {OrderText(o, props.app)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {toLocalTimeStr(o.unix || o.created_at, true)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {o.model}
                            </TableCell>
                            <TableCell style={{color}}>
                                {o.customer
                                    ? TwoLineInCell(o.customer.phone_number, o.customer.fio)
                                    : ''}
                            </TableCell>
                            <TableCell style={{color}}>
                                {renderStatus(o.stock_id, o.id, o.status_id)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {master ? master.name : ''}
                            </TableCell>
                        </TableRow>
                    })}
            </TableBody>
        </Table>

    </div>

}

export default connect(state => state)(Orders)
