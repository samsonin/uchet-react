import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import rest from "../components/Rest"
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import StocksSelect from "./common/StocksSelect";
import {makeStyles} from "@material-ui/core/styles";
import {Paper, Typography} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import {bindActionCreators} from "redux";
import {upd_app} from "../actions/actionCreator";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";

import SaleModal from './Modals/Sale'

const useStyles = makeStyles((theme) => ({
    controls: {
        margin: 15,
        minWidth: 120,
    },
    employees: {
        margin: 15,
        marginLeft: 30
    },
    table: {
        margin: '1rem'
    },
    totals: {
        margin: '1rem',
        padding: '1rem'
    },
    icon: {
        padding: 0,
        marginLeft: '.1rem',
        marginRight: '.1rem',
    }
}))

const minDate = '2020-01-01'
const full = d => d < 10 ? '0' + d : d
const today = (new Date()).getFullYear() + '-' + full(1 + (new Date()).getMonth()) + '-' + full((new Date()).getDate())

const prepaidArray = ['предоплата']
const salesArray = ['продажа', 'возврат', 'из залога', 'выкупили', 'продали']
const serviceArray = ['0']
const costsArray = ['поступление', 'покупка', 'в залог', 'вернули', 'расход', 'зарплата', 'другое']

const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

const Daily = props => {

    const [stock, setStock] = useState(() => props.app.stock_id || props.app.stocks.find(s => s.is_valid).id)
    const [date, setDate] = useState(() => today)
    const [localDaily, setLocalDaily] = useState([])

    const [cashless, setCashless] = useState(0)
    const [handed, setHanded] = useState(0)

    const [row, setRow] = useState()
    const [isSaleOpen, setIsSaleOpen] = useState(false)

    const classes = useStyles()

    const setInRange = date => date > today
        ? today
        : date < minDate
            ? minDate
            : date

    useEffect(() => {

        if (!stock || !date || date === today) return

        if (date !== setInRange(date)) {
            return setDate(date => setInRange(date))
        }

        rest('daily/' + stock + '/' + date)
            .then(res => {

                if (res.status === 200) {
                    setLocalDaily(res.body)
                }

            })

    }, [stock, date])

    const daily = date === today
        ? props.app.daily.find(d => d.stock_id === stock)
        : localDaily

    const canChange = date === today && props.app.stock_id === stock

    const canAdminChange = date === today && props.auth.admin

    const afterRes = res => {

        if (res.status === 200) {

            props.upd_app(res.body)

        }

    }

    const cashlessHandler = () => {

        rest('daily/' + stock, 'PATCH', {cashless})
            .then(afterRes)

    }

    const cashlessHandlerAdd = () => {

        rest('daily/' + stock, 'PATCH', {cashless})
            .then(afterRes)

    }

    const handedHandler = () => {

        if (!props.auth.admin) return

        rest('daily/' + stock + '/' + handed, 'PUT')
            .then(afterRes)

    }

    const handedHandlerAdd = () => {

        if (!props.auth.admin) return

        rest('daily/' + stock + '/' + handed, 'PUT')
            .then(afterRes)

    }

    const employeeCheckout = employee_id => {

        const employees = daily.employees.filter(e => e !== employee_id)

        rest('daily/' + stock, 'PATCH', {employees})
            .then(afterRes)

    }

    // useEffect(() => {
    //
    //     setCashless(daily.cashless)
    //
    // }, [daily.cashless])
    //
    // useEffect(() => {
    //
    //     setHanded(daily.handed)
    //
    // }, [daily.handed])

    const handler = row => {

        if (row.action === 'продажа') {

            setRow(row)
            setIsSaleOpen(true)

        }

    }

    const makeForTable = array => {

        let answer = daily && daily.sales
            ? daily.sales.filter(s => array.includes(s.action))
            : []

        let sum = 0;

        answer.map(s => {
            sum += s.sum
        })

        return [answer, sum]

    }

    let [prepaids, prepaidsSum] = makeForTable(prepaidArray)
    let [sales, salesSum] = makeForTable(salesArray)
    let [services, serviceSum] = makeForTable(serviceArray)
    let [costs, costSum] = makeForTable(costsArray)

    let imprests = daily && daily.imprests
        ? daily.imprests
        : []

    let imprestsSum = 0

    imprests.map(i => imprestsSum += i.sum)

    return <>

        <SaleModal
            isOpen={isSaleOpen}
            close={() => setIsSaleOpen(false)}
            row={row}
        />

        <Grid container
              justify={'center'}
              alignItems={'center'}
        >
            <Grid item xs={6}>

                <StocksSelect
                    stocks={props.app.stocks}
                    stock={stock}
                    setStock={setStock}
                    disabled={false}
                    classes={classes.controls}
                />

            </Grid>

            <Grid item xs={6}>
                <TextField
                    className={classes.controls}
                    variant="outlined"
                    disabled={false}
                    label="дата"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
        </Grid>

        <Grid item className="p-2">
            <List dense>
                {daily && daily.employees && daily.employees.map(e => {

                    let user = props.app.users.find(u => u.id === e)

                    return user && <ListItem
                        key={'userindailylistitem' + user.id}
                        component={Paper}
                        className="m-1"
                    >
                        <ListItemText
                            primary={user.name}
                        />
                        {canAdminChange && <ListItemSecondaryAction>
                            <IconButton
                                onClick={() => employeeCheckout(user.id)}
                            >
                                <ExitToAppIcon/>
                            </IconButton>
                        </ListItemSecondaryAction>}
                    </ListItem>
                })}
            </List>
        </Grid>

        {[
            {
                title: 'Предоплаты', addText: 'Внести предоплату', addOnClick: () => console.log('addPrepaid'),
                titles: ['Наименование', 'Сумма', 'Примечание'],
                rows: prepaids,
                rowsValues: ['item', 'sum', 'note'],
                sum: prepaidsSum
            },
            {
                title: 'Товары', addText: 'Продать товар', addOnClick: () => console.log('addGood'),
                titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                rows: sales,
                rowsValues: ['action', 'item', 'sum', 'note'],
                sum: salesSum
            },
            {
                title: 'Работы, услуги', addText: 'Продать услугу', addOnClick: () => console.log('addService'),
                titles: ['#', 'Что сделали', 'Сумма', 'Сотрудник'],
                rows: services,
                rowsValues: ['id', 'item', 'sum', 'ui_user_id'],
                sum: serviceSum
            },
            {
                title: 'Расходы', addText: 'Внести расход, зарплату', addOnClick: () => console.log('addCost'),
                titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                rows: costs,
                rowsValues: ['action', 'item', 'sum', 'note'],
                sum: costSum
            },
            {
                title: 'Подотчеты', addText: 'Внести подотчет', addOnClick: () => console.log('addImprest'),
                titles: ['Наименование', 'Сотрудник', 'Сумма', 'Примечание'],
                rows: imprests,
                rowsValues: ['item', 'ui_user_id', 'sum', 'note'],
                sum: imprestsSum
            },
        ]
            .map(t => date !== today && t.rows === imprests
                ? ''
                : <TableContainer
                    key={'tablecontindailykey' + t.title}
                    className={classes.table}
                    component={Paper}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={t.titles.length - 1}>
                                    <Typography variant="h6">
                                        {t.title}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {canChange
                                        ? <Tooltip title={t.addText}>
                                            <IconButton className={classes.icon}
                                                        onClick={() => t.addOnClick}
                                            >
                                                <AddCircleIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        : ''}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableHead>
                            <TableRow>
                                {t.titles.map(t => <TableCell
                                    key={'rowsintabledaily' + t}
                                >{t}</TableCell>)}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {t.rows.map(row => <TableRow
                                key={'tablerowindaily' + t.title + JSON.stringify(row)}
                                style={{
                                    cursor: 'pointer'
                                }}
                                onClick={() => handler(row)}
                            >
                                {t.rowsValues.map(v => {

                                    let value = row[v]

                                    if (v === 'ui_user_id') {

                                        let user = props.app.users.find(u => u.id === row.ui_user_id)

                                        value = user
                                            ? user.name
                                            : row.ui_user_id

                                    }

                                    return <TableCell
                                        key={'rowsintabledailysec' + v}
                                    >
                                        {row.work
                                            ? v === 'item'
                                                ? <>
                                                    <span className="font-weight-bold pr-3">{row.item}</span>
                                                    <br/>
                                                    {row.work}
                                                </>
                                                : value
                                            : v === 'id'
                                                ? ''
                                                : value}
                                    </TableCell>
                                })}
                            </TableRow>)}
                        </TableBody>

                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={t.titles.length - 2}>
                                    Итого:
                                </TableCell>
                                <TableCell>
                                    {t.sum}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                    </Table>
                </TableContainer>)}

        {daily && <TableContainer
            className={classes.table}
            component={Paper}
        >
            <Table size="small">
                <TableBody>
                    {[
                        {text: 'Остаток на утро:', value: daily.morning},
                        {text: 'Выручка:', value: daily.proceeds},
                        {text: 'Подотчеты:', value: imprestsSum},
                        {
                            text: 'Безнал:', value: cashless,
                            change: e => setCashless(+e.target.value),
                            disabled: cashless === daily.cashless,
                            click: canChange && cashlessHandler,
                            clickAdd: canChange && cashlessHandlerAdd
                        },
                        {
                            text: 'Сдали:', value: handed,
                            change: e => setHanded(+e.target.value),
                            disabled: handed === daily.handed,
                            click: (canChange || canAdminChange) && handedHandler,
                            clickAdd: (canChange || canAdminChange) && handedHandlerAdd
                        },
                        {text: 'Остаток:', value: daily.evening},
                    ].map(l => (date === today || l.text !== 'Подотчеты:') && <TableRow
                                key={'griditemkeyindailypertotals' + l.text}
                            >

                                <TableCell style={{
                                    fontWeight: 'bold'
                                }}>
                                    {l.text}
                                </TableCell>

                                <TableCell>
                                    {l.click
                                        ? <TextField
                                            value={l.value}
                                            type="number"
                                            onChange={l.change}
                                        />
                                        : l.value}
                                </TableCell>

                                {l.click && <TableCell
                                    style={{
                                        width: '15%',
                                    }}>
                                    <IconButton
                                        className={classes.icon}
                                        onClick={l.click}
                                        disabled={l.disabled}
                                    >
                                        <SaveOutlinedIcon/>
                                    </IconButton>
                                    <IconButton
                                        className={classes.icon}
                                        onClick={l.clickAdd}
                                        disabled={l.disabled}
                                    >
                                        <AddCircleIcon/>
                                    </IconButton>
                                </TableCell>}

                            </TableRow>)}
                        </TableBody>
                        </Table>
                        </TableContainer>}

                        </>

                        }

                        export default connect(state => state, mapDispatchToProps)(Daily);