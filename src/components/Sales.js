import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import TextField from "@mui/material/TextField";
import {Button, InputAdornment, Table, TableBody} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useSnackbar} from "notistack";

import rest from "../components/Rest"
import StocksCheck from "./common/StocksCheck";
import DateInterval from "./common/DateInterval";
import ActionsSelect from "./common/ActionsSelect";
import {intInputHandler} from "./common/InputHandlers";
import UsersSelect from "./common/UsersSelect";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time";


const style = {
    width: '100%',
    margin: '.5em',
    padding: '.5em',
}

const Sales = props => {

    const appStocks = props.app.stocks || []
    const appUsers = props.app.users || []
    const searchParams = new URLSearchParams(props.location.search || '')
    const stockIdFromUrl = +(searchParams.get('stock_id') || searchParams.get('stock') || 0)
    const strFromUrl = searchParams.get('str') || ''

    const [stocks, setStocks] = useState(() => stockIdFromUrl
        ? [stockIdFromUrl]
        : appStocks
            .map(s => s.is_valid ? s.id : null)
            .filter(s => s))
    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()
    const [action, setAction] = useState()
    const [str, setStr] = useState(strFromUrl)
    const [sum, setSum] = useState(0)
    const [userId, setUserId] = useState()
    const [error, setError] = useState(false)
    const [sales, setSales] = useState([])
    const [isRest, setIsRest] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const isEmpty = !(date1 || date2 || action || str || sum)

    let total = 0

    const find = () => {

        if (isEmpty) {
            setError(true)
            return enqueueSnackbar('введите параметры поиска', {variant: 'error'})
        }

        let url = 'sales?'

        if (stocks) {
            stocks.map(s => {
                if (s) url += 'stock_ids[]=' + s + '&'
                return s
            })
        } else {
            return enqueueSnackbar('выберите точки', {variant: 'error'})
        }

        if (date1) url += 'date1=' + date1 + '&'
        if (date2) url += 'date2=' + date2 + '&'
        if (action) url += 'action=' + action + '&'
        if (userId) url += 'user_id=' + userId + '&'
        if (sum) url += 'sum=' + sum + '&'
        if (str) url += 'str=' + str + '&'

        if (isRest) return
        setIsRest(true)

        rest(url)
            .then(res => {

                setIsRest(false)

                if (res.status === 200) {
                    setSales(res.body)
                } else if(res.status === 204){
                    setSales([])
                    return enqueueSnackbar('ничего не найдено', {variant: 'warning'})
                } else {
                    return enqueueSnackbar('ошибка запроса', {variant: 'error'})
                }

            })

    }

    useEffect(() => {
        if (strFromUrl) find()
// eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (props.enterPress) find()
        props.setEnterPress(false)
// eslint-disable-next-line
    }, [props.enterPress])

    const renderRow = sale => {

        const stock = appStocks.find(s => s.id === sale.stock_id)
        const user = appUsers.find(u => u.id === sale.user_id)

        total += sale.sum

        return <TableRow className="sales-table-row">
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

    return <div className="sales-page">
        <div className="sales-panel">

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
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    },
                }}
                value={str}
                onChange={e => setStr(e.target.value)}
            />

            <Button
                disabled={isEmpty || isRest}
                variant="contained"
                color="primary"
                style={style}
                onClick={() => find()}
            >
                Найти
            </Button>

        </div>

        <div className="sales-panel sales-results-panel">

            {sales.length ? <Table size="small" className="sales-table">
                    <TableHead>
                        <TableRow className="sales-total-row">
                            <TableCell>Действие</TableCell>
                            <TableCell>Наименование</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Сотрудник</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sales.map(s => renderRow(s))}

                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Всего</TableCell>
                            <TableCell>{total}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
                : null}

        </div>

    </div>
}

export default connect(state => state)(Sales)
