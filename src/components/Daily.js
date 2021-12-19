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
import {useSnackbar} from "notistack";

import SaleModal from './Modals/Sale'
import PrepaidModal from './Modals/Prepaid'
import Consignment from "./Consignment";
import DailyModal from "./Modals/Daily";

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
    const [localDaily, setLocalDaily] = useState({})

    const [cashless, setCashless] = useState(0)
    const [handed, setHanded] = useState(0)

    const [row, setRow] = useState()
    const [modalType, setModalType] = useState()
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false)
    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [isSaleOpen, setIsSaleOpen] = useState(false)
    const [consignment, setConsignment] = useState()
    const [isConsignmentOpen, setIsConsignmentOpen] = useState(false)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()


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
                } else {
                    enqueueSnackbar(date + ' не работали', {variant: 'error'})
                }

            })

    }, [stock, date])

    const daily = date === today
        ? props.app.daily.find(d => d.stock_id === stock)
        : localDaily

    const canChange = date === today && props.app.stock_id === stock

    const canAdminChange = date === today && props.auth.admin

    const afterRes = (res, local, text) => {

        if (res.status === 200) {

            props.upd_app(res.body)

            local && local(0)

            enqueueSnackbar(text || 'ok', {variant: 'success'})

        } else {

            enqueueSnackbar('ошибка', {variant: 'error'})

        }

    }

    const cashlessRest = data => {

        rest('daily/' + stock, 'PATCH', data)
            .then(res => afterRes(res, setCashless, 'безнал: ' + data.cashless))

    }

    const handedRest = handed => {

        if (!props.auth.admin) return

        rest('daily/' + stock + '/' + handed, 'PUT')
            .then(res => afterRes(res, setHanded, 'сдано: ' + handed))

    }

    const cashlessHandler = () => cashlessRest({cashless})

    const cashlessHandlerAdd = () => cashlessRest({cashless: daily.cashless + cashless})

    const handedHandler = () => handedRest(handed)

    const handedHandlerAdd = () => handedRest(daily.handed + handed)

    const employeeCheckout = employee_id => {

        const employees = daily.employees.filter(e => e !== employee_id)

        rest('daily/' + stock, 'PATCH', {employees})
            .then(afterRes)

    }

    const handler = (modalType, row) => {

        setModalType(modalType)
        setRow(row)

        if (modalType === 'Предоплаты') {

            setIsPrepaidOpen(true)

        } else if (row) {

            if (row.action === 'продажа') {

                setIsSaleOpen(true)

            } else if (row.action === 'поступление') {

                try {

                    const wf = JSON.parse(row.wf)

                    if (date !== today) wf.date = date

                    setConsignment(wf)
                    setIsConsignmentOpen(true)

                } catch (e) {

                    console.log(e)

                }

            } else if (row.action === '0') {

                try {

                    const wf = JSON.parse(row.wf)

                    if (wf.rem_id) {

                        return props.history.push('/order/' + stock + '/' + wf.rem_id)

                    }

                } catch (e) {

                    console.log(e)

                }

            } else if (['продали', 'вернули', 'купили', 'покупка', 'возврат'].includes(row.action)) {

                if (row.good && row.good.barcode) props.setOurBarcode(row.good.barcode)
                else {

                    try {

                        const wf = JSON.parse(row.wf)

                        if (wf.barcode) props.setOurBarcode(wf.barcode)
                        else if (wf.showcase) props.setOurBarcode(115104000000 + +wf.showcase)
                        else if (wf.parts) props.setOurBarcode(112116000000 + +wf.parts)
                        else if (wf.goods) props.setOurBarcode(103100000000 + +wf.goods)

                        else console.error('нет штрихкода', row)

                    } catch (e) {
                        console.error('неправильный wf', row)
                    }

                }

            } else if (['в залог', 'выкупили'].includes(row.action)) {

                try {

                    const wf = JSON.parse(row.wf)

                    if (wf.zalog_id) {
                        console.log('открыть залог #', wf.zalog_id)
                    }

                } catch (e) {
                    console.log(e)
                }

            } else {

                if (date === today) setIsDailyModalOpen(true)

            }

        } else {

            setIsDailyModalOpen(true)

        }

    }

    const makeForTable = array => {

        let answer = daily && daily.sales
            ? daily.sales.filter(s => array.includes(s.action))
            : []

        let sum = 0;
// eslint-disable-next-line
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

    let prepaidId
    if (row && row.wf) {
        try {
            const wf = JSON.parse(row.wf)
            prepaidId = wf.zakaz
        } catch (e) {
            console.log('JSON.parse.error', e)
        }
    }

    return isConsignmentOpen
        ? <Consignment
            close={() => setIsConsignmentOpen(false)}
            consignment={consignment}
        />
        : <>
            {isPrepaidOpen && <PrepaidModal
                isOpen={isPrepaidOpen}
                close={() => {
                    setIsPrepaidOpen(false)
                    setRow(null)
                }}
                preData={row}
                preId={prepaidId}
            />}

            {isSaleOpen && <SaleModal
                isOpen={isSaleOpen}
                close={() => {
                    setIsSaleOpen(false)
                    setRow(null)
                }}
                row={row}
            />}

            {isDailyModalOpen && <DailyModal
                type={modalType}
                isOpen={isDailyModalOpen}
                close={() => {
                    setIsDailyModalOpen(false)
                    setRow(null)
                }}
                row={row}
                disabled={!canChange}
                afterRes={afterRes}
            />}

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

            {date !== today && !localDaily.hasOwnProperty('id')
                ? <div style={{
                    margin: '1rem',
                    fontSize: 20
                }}>
                    Нет Данных
                </div>
                : <>
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
                            title: 'Предоплаты', addText: 'Внести предоплату',
                            titles: ['Наименование', 'Сумма', 'Примечание'],
                            rows: prepaids,
                            rowsValues: ['item', 'sum', 'note'],
                            sum: prepaidsSum,
                        },
                        {
                            title: 'Товары', addText: 'Продать товар',
                            titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                            rows: sales,
                            rowsValues: ['action', 'item', 'sum', 'note'],
                            sum: salesSum,
                        },
                        {
                            title: 'Работы, услуги', addText: 'Продать услугу',
                            titles: ['#', 'Что сделали', 'Сумма', 'Сотрудник'],
                            rows: services,
                            rowsValues: ['id', 'item', 'sum', 'ui_user_id'],
                            sum: serviceSum,
                        },
                        {
                            title: 'Расходы, зарплата', addText: 'Внести расход, зарплату',
                            titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                            rows: costs,
                            rowsValues: ['action', 'item', 'sum', 'note'],
                            sum: costSum,
                        },
                        {
                            title: 'Подотчеты', addText: 'Внести подотчет',
                            titles: ['Наименование', 'Сотрудник', 'Сумма', 'Примечание'],
                            rows: imprests,
                            rowsValues: ['item', 'ui_user_id', 'sum', 'note'],
                            sum: imprestsSum,
                        },
                    ]
                        .map(t => date !== today && t.rows === imprests
                            ? ''
                            : <div key={'tablecontindailykey' + t.title}
                                   style={{margin: '0 1rem 0 0'}}
                            >
                                <TableContainer
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
                                                                        onClick={() => handler(t.title)}
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
                                                onClick={() => handler(t.title, row)}
                                            >
                                                {t.rowsValues.map(v => {

                                                    let value = row[v]

                                                    if (v === 'ui_user_id') {

                                                        let user = props.app.users.find(u => u.id === row.ui_user_id)

                                                        value = user
                                                            ? user.name
                                                            : row.ui_user_id

                                                    }

                                                    if (row.action === 'зарплата' && v === 'note') {

                                                        let user = props.app.users.find(u => u.id === row.ui_user_id)

                                                        const userName = user
                                                            ? user.name
                                                            : row.ui_user_id

                                                        return <TableCell
                                                            key={'rowsintabledailysec' + v}
                                                        >
                                                            <span className="font-weight-bold pr-3">{userName}</span>
                                                            <br/>
                                                            {row.note}
                                                        </TableCell>
                                                    }

                                                    return <TableCell
                                                        key={'rowsintabledailysec' + v}
                                                    >
                                                        {row.work
                                                            ? v === 'item'
                                                                ? <>
                                                                <span
                                                                    className="font-weight-bold pr-3">{row.item}</span>
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
                                </TableContainer>
                            </div>)}


                    {daily && <div style={{margin: '0 1rem 0 0'}}>
                        <TableContainer
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
                                            text: 'Безнал:', value: daily.cashless,
                                            localValue: cashless,
                                            change: e => setCashless(+e.target.value),
                                            click: canChange && cashlessHandler,
                                            clickAdd: canChange && cashlessHandlerAdd
                                        },
                                        {
                                            text: 'Сдали:', value: daily.handed,
                                            localValue: handed,
                                            change: e => setHanded(+e.target.value),
                                            click: canAdminChange && handedHandler,
                                            clickAdd: canAdminChange && handedHandlerAdd
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
                                            {l.value}
                                        </TableCell>

                                        {l.click && <TableCell>

                                            <TextField
                                                value={l.localValue}
                                                type="number"
                                                onChange={l.change}
                                            />

                                            <IconButton
                                                className={classes.icon}
                                                onClick={l.click}
                                                disabled={l.value === l.localValue}
                                            >
                                                <SaveOutlinedIcon/>
                                            </IconButton>
                                            <IconButton
                                                className={classes.icon}
                                                onClick={l.clickAdd}
                                                disabled={l.localValue === 0}
                                            >
                                                <AddCircleIcon/>
                                            </IconButton>

                                        </TableCell>}

                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}

                </>}
        </>

}

export default connect(state => state, mapDispatchToProps)(Daily)