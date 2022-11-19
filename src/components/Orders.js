import React, {useEffect, useRef, useState} from 'react';
import {connect} from "react-redux";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
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
import {OrderText} from "./common/OrderText"


const initCustomer = {
    id: 0,
    fio: '',
    phone_number: ''
}

const Orders = props => {

    const [parameters, setParameters] = useState(false)

    const [stocks, setStocks] = useState(() => [props.app.current_stock_id])

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

    const afterRest = res => {

        if (res.status === 200) {

            setParameters(false)
            setOrders(res.body)

        } else if (res.status === 204) {

            enqueueSnackbar('Заказов не найдено', {variant: 'error'})

        }

    }


    useEffect(() => {

        inputRef.current.focus();

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

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }

    const renderStatus = (stock_id, order_id, status_id) => {

        const status = props.app.statuses.find(s => s.id === status_id)

        return status
            ? <div style={{
                backgroundColor: status ? '#' + status.color : '#fff',
                borderRadius: 5,
                padding: '.5rem',
                textAlign: 'center'
            }}
            >
                {status.name}
            </div>
            : null

    }

    const findButton = () => <Button
        style={{
            margin: '1rem'
        }}
        onClick={() => find()}
        color={'primary'}
        variant='outlined'
    >
        Найти
    </Button>

    return <div
        style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '1rem'
        }}
    >

        <div>

            <TextField
                style={{
                    margin: '1rem'
                }}
                label={"Заказ №"}
                value={id ? id.toString() : ''}
                onChange={e => intInputHandler(e.target.value, setId)}
                inputRef={inputRef}
            />

            {parameters || findButton()}

        </div>

        <Button style={{
            padding: '1rem',
            margin: '1rem'
        }}
                variant="outlined"
                size="small"
                onClick={() => setParameters(!parameters)}
        >
            Параметры поиска
        </Button>

        <Button style={{
            padding: '1rem',
            margin: '1rem'
        }}
                variant="outlined"
                size="small"
                onClick={() => getMy()}
        >
            Мои текущие
        </Button>

        {parameters && <>

            {!id && <CustomersSelect
                customer={customer}
                updateCustomer={updateCustomer}
                onlySearch={true}
            />}

            {!id && !(customer.id || customer.fio || customer.phone_number) && <>
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
                    classes="w-100 p-1 m-1"
                    label="Мастер"
                />

                <StatusesSelect
                    status={statusId}
                    statuses={props.app.statuses}
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

        <div style={{
            display: 'flex',
            justifyContent: 'space-between'
        }}>

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

        <Table size="small">
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

                        const master = props.app.users.find(u => u.id === o.master_id)

                        const color = o.defect && o.defect.indexOf('Технический осмотр') === 0
                            ? 'blue'
                            : 'black'

                        return <TableRow
                            style={{
                                cursor: 'pointer',
                            }}
                            key={'ordertablerowkeyinorders' + o.stock_id + (o.id || o.order_id)}
                            onClick={() => props.history.push('/order/' + o.stock_id + '/' + (o.id || o.order_id))}
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