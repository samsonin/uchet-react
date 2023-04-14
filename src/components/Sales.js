import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import TextField from "@material-ui/core/TextField";
import {Button, InputAdornment, Table, TableBody} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import {useSnackbar} from "notistack";

import rest from "../components/Rest"
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";
import ActionsSelect from "./common/ActionsSelect";
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time";


const style = {
    width: '100%',
    margin: '.5em',
    padding: '.5em',
}

const Sales = props => {

    const [stocks, setStocks] = useState(() => props.app.stocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))
    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()
    const [action, setAction] = useState()
    const [str, setStr] = useState()
    const [sum, setSum] = useState(0)
    const [userId, setUserId] = useState()
    const [error, setError] = useState(false)

    const [sales, setSales] = useState([])

    const {enqueueSnackbar} = useSnackbar()

    const isEmpty = !(date1 || date2 || action || str || sum)

    const find = () => {

        if (isEmpty) {
            setError(true)
            return enqueueSnackbar('введите параметры поиска', {variant: 'error'})
        }

        let url = 'sales?'

        if (stocks) {
            stocks.map(s => {
                if (s) url += 'stock_ids[]=' + s + '&'
            })
        } else {
            return enqueueSnackbar('выберите точки', {variant: 'error'})
        }

        if (date1) url += 'date1=' + date1 + '&'
        if (date2) url += 'date2=' + date2 + '&'
        if (action) url += 'action=' + action + '&'
        if (str) url += 'str=' + str + '&'
        if (sum) url += 'sum=' + sum + '&'

        rest(url)
            .then(res => {
                if (res.status === 200) {
                    setSales(res.body)
                }
            })

    }

    useEffect(() => {
        if (props.enterPress) find()
        props.setEnterPress(false)
// eslint-disable-next-line
    }, [props.enterPress])

    const renderRow = sale => {

        const stock = props.app.stocks.find(s => s.id === sale.stock_id)
        const user = props.app.users.find(u => u.id === sale.user_id)

        return <TableRow>
            <TableCell>
                {TwoLineInCell(sale.action, toLocalTimeStr(sale.unix))}
            </TableCell>
            <TableCell>
                {TwoLineInCell(sale.item, sale.note)}
            </TableCell>
            <TableCell>{sale.sum}</TableCell>
            <TableCell>
                {TwoLineInCell(stock ? stock.name : '', user ? user.name : '')}
            </TableCell>

        </TableRow>

    }

    return <>
        <div style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: '.5rem',
            paddingRight: '1rem'
        }}>

            <StocksCheck stocks={stocks} setStocks={setStocks}/>

            <DateInterval
                date1={date1}
                date2={date2}
                setDate1={setDate1}
                setDate2={setDate2}
            />

            <ActionsSelect
                action={action}
                setAction={setAction}
            />

            <TextField
                value={sum}
                onChange={e => intInputHandler(e.target.value, setSum)}
                style={style}
                label="Сумма"
            />

            <UsersSelect
                user={userId}
                users={props.app.users}
                setUser={setUserId}
                onlyValid
                classes="w-100"
                label="Сотрудник"
            />

            <TextField
                error={error}
                autoFocus
                style={style}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}
                value={str}
                onChange={e => setStr(e.target.value)}
            />

            <Button
                disabled={isEmpty}
                variant="contained"
                color="primary"
                style={style}
                onClick={() => find()}
            >
                Найти
            </Button>

        </div>

        <div style={{
            backgroundColor: '#fff',
            borderRadius: 5,
            marginTop: '1rem',
            padding: '.5rem',
            paddingRight: '1rem'
        }}>

            {sales.length ? <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Действие</TableCell>
                            <TableCell>Наименование</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Сотрудник</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sales.map(s => renderRow(s))}
                    </TableBody>
                </Table>
                : null}

        </div>

    </>
}

export default connect(state => state)(Sales)