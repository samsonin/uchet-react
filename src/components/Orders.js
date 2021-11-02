import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {Paper, Typography} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import SearchIcon from '@material-ui/icons/Search';

import rest from "../components/Rest"
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

const STATUSES = [
    'новый', // 0
    'готова диагностика', // 1
    'в процессе ремонта', // 2
    'ждем ответа', // 3
    'ждем запчасти', // 4
    'готов', // 5
    'выдали', // 6
    'без ремонта', // 7
    'на продаже', // 8
    'утилизирован', // 9
];

const Orders = props => {

    const [onlyMy, setOnlyMy] = useState(true)

    const [stocks, setStocks] = useState(() => [props.app.stock_id])

    const [id, setId] = useState(0)
    const [createdDate, setCreatedDate] = useState()
    const [createdDate2, setCreatedDate2] = useState()
    const [checkoutDate, setCheckoutDate] = useState()
    const [checkoutDate2, setCheckoutDate2] = useState()

    const [orders, setOrders] = useState()

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

        rest('allowedOrders')
            .then(res => {
                if (res.status === 200) {
                    setOrders(res.body)
                }
            })

    }, [])

    const handleOrder = (i, val) => {

    }

    const renderOrderText = ({order_id, stock_id}) => props.app.stock_id === stock_id
        ? order_id
        : props.app && props.app.stocks.find(s => s.id === stock_id).name + ', ' + order_id

    return <Grid container
                 component={Paper}
                 className="p-2"
                 spacing={1}
                 direction="column"
    >

        <Grid container
              justify={'flex-end'}
        >
            {/*<Typography variant="h5">*/}
            {/*    Парамерты поиска*/}
            {/*</Typography>*/}
            <IconButton
                onClick={() => setOnlyMy(!onlyMy)}
                style={{marginRight: 1}}
            >
                <SearchIcon/>
                {/*{onlyMy*/}
                {/*    ? <KeyboardArrowUpIcon/>*/}
                {/*    : <KeyboardArrowDownIcon/>}*/}
            </IconButton>
        </Grid>

        {onlyMy || <div>
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

                <TextField
                    type="number"
                    key={"idonordersseach"}
                    className={"m-2 p-2"}
                    label={"Заказ №"}
                    value={id.toString()}
                    onChange={e => setId(e.target.value)}
                />

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
        </div>}

        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>#</TableCell>
                    <TableCell>Устройство</TableCell>
                    <TableCell colSpan={2}>Заказчик</TableCell>
                    <TableCell>Статус</TableCell>
                    {onlyMy ? null : <TableCell>Мастер</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {orders && orders.map(o => {

                    const status = props.app.statuses.find(s => s.id === o.status_id)

                    console.log(status)

                    return <TableRow
                        style={{
                            backgroundColor: status.color,
                            cursor: 'pointer'
                        }}
                        key={'ordertablerowkeyinorders' + o.stock_id + o.order_id}
                        onClick={() => console.log('row onClick')}
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
                        <TableCell>
                            {o.customer_id}
                        </TableCell>
                        <TableCell>
                            {o.customer_id}
                        </TableCell>
                        <TableCell>
                            {status.name}
                        </TableCell>
                        {onlyMy || <TableCell>
                            {o.master_id}
                        </TableCell>}
                    </TableRow>
                })}
            </TableBody>
        </Table>


    </Grid>


}

export default connect(state => state)(Orders)