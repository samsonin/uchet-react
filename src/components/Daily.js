import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import StocksSelect from "./common/StocksSelect";
import { makeStyles } from "muiLegacyStyles";
import { Paper, Typography } from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import List from "@mui/material/List";
import { useSnackbar } from "notistack";

import rest from "../components/Rest"
import SaleModal from './Modals/Sale'
import PrepaidModal from './Modals/Prepaid'
import Consignment from "./Consignment";
import DailyModal from "./Modals/Daily";
import { numberInputHandler } from "./common/InputHandlers";
import InteractionTableRow from "./common/InteractionTableRow";
import { setInRange, today } from "./common/Time";
import {
    canViewDailyGoodsProfit,
    findCashPaymentDiscrepanciesBySaleId,
    getDailySalesProfit,
    getUnmatchedCashPaymentDiscrepancies,
    normalizeCashPaymentDiscrepancies,
    normalizeDailyEmployees,
    normalizeDailyReport,
} from "../common/dailyReports";

const mainUrl = document.location.protocol + '//' + document.location.host


const useStyles = makeStyles(() => ({
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


const prepaidArray = ['предоплата']
const salesArray = ['продажа', 'возврат', 'из залога', 'выкупили', 'продали']
const serviceArray = ['0']
const costsArray = ['поступление', 'покупка', 'в залог', 'вернули', 'расход', 'зарплата', 'другое']


const PAYMENT_TYPE_LABEL = '\u0421\u043f\u043e\u0441\u043e\u0431'
const PAYMENT_EMPTY_LABEL = '\u0414\u0430\u043d\u043d\u044b\u0435 \u043f\u043e \u0441\u043f\u043e\u0441\u043e\u0431\u0430\u043c \u043e\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u044b'
const CLOSE_LABEL = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c'
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'
const CASH_LABEL = '\u041d\u0430\u043b\u0438\u0447\u043d\u044b\u0435'

const parseMaybeJson = value => {
    if (!value || typeof value !== 'string') return value || {}

    try {
        return JSON.parse(value)
    } catch (error) {
        return {}
    }
}

const getPaymentTypeName = (paymentTypes, id) => {
    const paymentType = paymentTypes.find(type => +type.id === +id)
    return paymentType?.name || (id === 'cash' || +id === 0 ? CASH_LABEL : '#' + id)
}

const getPaymentKey = id => (id === 'cash' || +id === 0) ? 'cash' : String(id)

const getPaymentTypeOptions = paymentTypes => {
    const hasCash = paymentTypes.some(type => +type.id === 0)
    const activeTypes = paymentTypes
        .filter(type => type.is_active !== false)
        .map(type => ({
            value: type.id,
            name: type.name,
        }))

    return hasCash
        ? activeTypes
        : [{ value: 0, name: CASH_LABEL }, ...activeTypes]
}

const getRowPayments = (row, paymentTypes) => {
    const wf = parseMaybeJson(row?.wf)
    const paymentId = wf?.payment_id ?? row?.payment_id ?? 0

    return [{
        id: paymentId,
        key: getPaymentKey(paymentId),
        name: getPaymentTypeName(paymentTypes, paymentId),
        sum: +row?.sum || 0,
    }].filter(payment => payment.sum)
}

const getPaymentTotals = (rows, paymentTypes) => {
    const totals = new Map()
    const allowedKeys = new Set()

    paymentTypes
        .filter(type => +type.id !== 0 && type.is_active !== false)
        .forEach(type => {
            const key = getPaymentKey(type.id)

            allowedKeys.add(key)
            totals.set(key, {
                key,
                name: type.name,
                sum: 0,
            })
        })

    rows.forEach(row => {
        getRowPayments(row, paymentTypes).forEach(payment => {
            const key = payment.key || getPaymentKey(payment.id)
            const current = totals.get(key)

            if (!allowedKeys.has(key) || !current) return

            current.sum += payment.sum
            totals.set(key, current)
        })
    })

    return Array.from(totals.values())
}

const buildPaymentsPayload = paymentRows => ({ payment_id: paymentRows[0]?.id ?? 0 })

const getPaymentDraftRows = (row, paymentTypes) => {
    const currentPayments = getRowPayments(row, paymentTypes)
    const currentPayment = currentPayments[0]

    return currentPayment ? [currentPayment] : []
}

const getSaleId = row => {
    const wf = parseMaybeJson(row?.wf)
    return row?.sale_id ?? wf?.sale_id ?? row?.id
}

const Daily = props => {

    const appStocks = props.app.stocks || []
    const appStockUsers = props.app.stockusers || []
    const appDaily = props.app.daily || []
    const appUsers = props.app.users || []
    const appPaymentTypes = props.app.payment_types || []

    const [stock, setStock] = useState(() => {
        const firstValidStock = appStocks.find(s => s.is_valid)
        return props.app.current_stock_id || firstValidStock?.id || 0
    })
    const [date, setDate] = useState(() => today)
    const [localDaily, setLocalDaily] = useState({})
    const [localCashPaymentDiscrepancies, setLocalCashPaymentDiscrepancies] = useState([])

    const [handed, setHanded] = useState(0)

    const [row, setRow] = useState()
    const [modalType, setModalType] = useState()
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false)
    const [isPrepaidOpen, setIsPrepaidOpen] = useState(false)
    const [isSaleOpen, setIsSaleOpen] = useState(false)
    const [consignment, setConsignment] = useState()
    const [isConsignmentOpen, setIsConsignmentOpen] = useState(false)
    const [paymentRow, setPaymentRow] = useState()
    const [paymentDrafts, setPaymentDrafts] = useState([])
    const [isPaymentSaving, setPaymentSaving] = useState(false)
    const [cashPaymentVideos, setCashPaymentVideos] = useState([])

    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar()

    const validStockIds = appStockUsers
        .filter(su => su.user_id === props.auth.user_id)
        .map(su => su.stock_id)

    const validStocks = appStocks
        .filter(s => [2, 4].includes(props.auth.user_id) || validStockIds.includes(s.id))
    const selectableStocks = validStocks.filter(s => s.is_valid)
    const hasMultipleStocks = selectableStocks.length > 1


    useEffect(() => {

        if (!stock || !date || date === today) return

        if (date !== setInRange(date)) {
            return setDate(date => setInRange(date))
        }

        rest('daily/' + stock + '/' + date, 'GET', '', false, { updateStore: false })
            .then(res => {

                const dailyReport = normalizeDailyReport(res.body, stock)

                if (res.status === 200 && dailyReport) {
                    setLocalDaily(dailyReport)
                    setLocalCashPaymentDiscrepancies(normalizeCashPaymentDiscrepancies(res.body))
                } else {
                    setLocalDaily(null)
                    setLocalCashPaymentDiscrepancies([])
                    enqueueSnackbar(date + ' не работали', { variant: 'error' })
                }

            })

    }, [stock, date])

    useEffect(() => {
        if (!stock && selectableStocks[0]) setStock(selectableStocks[0].id)
    }, [stock, selectableStocks])

    useEffect(() => {
        setPaymentDrafts(paymentRow ? getPaymentDraftRows(paymentRow, appPaymentTypes) : [])
    }, [paymentRow, appPaymentTypes])

    const daily = date === today
        ? appDaily.find(d => +d.stock_id === +stock)
        : localDaily
    const dailyEmployees = normalizeDailyEmployees(daily?.employees, appUsers)
    const cashPaymentDiscrepancies = props.auth.user_id === 4
        ? (date === today
            ? props.app.cash_payment_discrepancies || []
            : localCashPaymentDiscrepancies)
        : []
    const unmatchedCashPaymentDiscrepancies = getUnmatchedCashPaymentDiscrepancies(cashPaymentDiscrepancies)

    const canChange = date === today && props.app.current_stock_id === stock

    const canAdminChange = date === today && props.auth.admin
    const canViewGoodsProfit = canViewDailyGoodsProfit(props.auth)

    const afterRes = (res, local, text) => {

        if (res.status === 200) {

            local && local(0)

            enqueueSnackbar(text || 'ok', { variant: 'success' })

        } else {

            enqueueSnackbar('ошибка', { variant: 'error' })

        }

    }

    const handedRest = handed => {

        if (!props.auth.admin) return

        rest('daily/' + stock + '/' + handed, 'PUT')
            .then(res => afterRes(res, setHanded, 'сдано: ' + handed))

    }

    const handedHandler = () => handedRest(handed)

    const handedHandlerAdd = () => handedRest(daily.handed + +handed)

    const employeeCheckout = employee_id => {

        const employees = daily.employees.filter(e => +e !== +employee_id)

        rest('daily/' + stock, 'PATCH', { employees })
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

                    if (date !== today) row.wf.date = date

                    setConsignment(row.wf)
                    setIsConsignmentOpen(true)

                } catch (e) {

                    console.log(e)

                }

            } else if (row.action === '0' || (row.action === 'расход' && row.wf.rem_id)) {

                if (stock && row.wf.rem_id) return window.open(mainUrl + '/order/' + stock + '/' + row.wf.rem_id, "_blank")

            } else if (['продали', 'вернули', 'купили', 'покупка', 'возврат'].includes(row.action)) {

                if (row.good && row.good.barcode) props.setOurBarcode(row.good.barcode)
                else {

                    try {

                        const wf = row.wf

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

                    if (row.wf.zalog_id) props.history.push('/pledges/' + row.wf.zalog_id)

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
    const salesProfit = getDailySalesProfit(sales)
    const paymentTotals = getPaymentTotals(daily?.sales || [], appPaymentTypes)

    let imprests = daily && daily.imprests
        ? daily.imprests
        : []

    let imprestsSum = 0

    imprests.map(i => imprestsSum += i.sum)
    const cashlessTotalRows = paymentTotals.length
        ? paymentTotals.map(payment => ({
            text: payment.name + ':',
            value: payment.sum,
        }))
        : [{ text: 'Безнал:', value: daily?.cashless }]

    let prepaidId
    if (row && row.wf) {
        try {
            prepaidId = row.wf.zakaz
        } catch (e) {
            console.log('JSON.parse.error', e)
        }
    }

    const paymentRows = paymentDrafts
    const paymentTypeOptions = getPaymentTypeOptions(appPaymentTypes)
    const openPayments = (event, row) => {
        event.stopPropagation()
        setPaymentRow(row)
    }
    const openCashPaymentVideos = (event, videos) => {
        event.stopPropagation()
        if (videos.length === 1) {
            window.open(videos[0].url, '_blank', 'noopener,noreferrer')
            return
        }
        setCashPaymentVideos(videos)
    }
    const renderSumCell = (row, value) => {
        const videos = findCashPaymentDiscrepanciesBySaleId(cashPaymentDiscrepancies, getSaleId(row))

        return <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
        }}>
            <span>{value}</span>
            {videos.length > 0 && <Button
                size="small"
                variant="outlined"
                onClick={event => openCashPaymentVideos(event, videos)}
                style={{
                    minWidth: 0,
                    padding: '1px 6px',
                    lineHeight: 1.4,
                }}
            >
                видео{videos.length > 1 ? ' ' + videos.length : ''}
            </Button>}
        </span>
    }
    const changePaymentDraft = id => {
        const paymentType = appPaymentTypes.find(type => String(type.id) === String(id))

        setPaymentDrafts(prev => prev.map(payment => ({
            ...payment,
            id,
            key: getPaymentKey(id),
            name: paymentType?.name || getPaymentTypeName(appPaymentTypes, id),
        })))
    }
    const savePaymentDrafts = () => {
        if (!paymentRow || isPaymentSaving) return

        const payload = buildPaymentsPayload(paymentDrafts)

        setPaymentSaving(true)

        rest('sales/' + stock + '/' + getSaleId(paymentRow), 'PATCH', payload)
            .then(res => {
                if (res.status === 200) {
                    const nextWf = parseMaybeJson(paymentRow.wf)
                    delete nextWf.payments
                    nextWf.payment_id = payload.payment_id

                    setPaymentRow({
                        ...paymentRow,
                        wf: nextWf,
                    })
                    enqueueSnackbar('ok', { variant: 'success' })
                    setPaymentRow(null)
                } else {
                    enqueueSnackbar('ошибка', { variant: 'error' })
                }
            })
            .finally(() => setPaymentSaving(false))
    }

    return isConsignmentOpen
        ? <Consignment
            close={() => setIsConsignmentOpen(false)}
            consignment={consignment}
        />
        : <>
            <Dialog
                open={cashPaymentVideos.length > 0}
                onClose={() => setCashPaymentVideos([])}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="h6" gutterBottom>
                        Видео передачи наличных
                    </Typography>
                    <List dense>
                        {cashPaymentVideos.map(item => <ListItem
                            key={'cash-payment-video-' + item.id}
                            component="a"
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            button
                        >
                            <ListItemText
                                primary={item.time || 'Видео'}
                                secondary={item.status}
                            />
                        </ListItem>)}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCashPaymentVideos([])}>
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(paymentRow)}
                onClose={() => setPaymentRow(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    {paymentRows.length
                        ? paymentRows.map(payment => <div
                            key={'daily-payment-row-' + payment.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                            }}
                        >
                            <FormControl
                                className="daily-payment-method-control"
                                size="small"
                                fullWidth
                                disabled={!canChange}
                            >
                                <InputLabel id="daily-payment-method-label">{PAYMENT_TYPE_LABEL}</InputLabel>
                                <Select
                                    labelId="daily-payment-method-label"
                                    label={PAYMENT_TYPE_LABEL}
                                    value={payment.id}
                                    onChange={event => changePaymentDraft(event.target.value)}
                                >
                                    {paymentTypeOptions.map(type => <MenuItem
                                        key={'daily-payment-type-' + type.value}
                                        value={type.value}
                                    >
                                        {type.name}
                                    </MenuItem>)}
                                </Select>
                            </FormControl>
                            <Typography style={{ minWidth: 72, textAlign: 'right' }}>{payment.sum}</Typography>
                        </div>)
                        : <Typography color="textSecondary">
                            {PAYMENT_EMPTY_LABEL}
                        </Typography>}
                </DialogContent>
                <DialogActions>
                    {canChange && paymentRows.length > 0 && <Button
                        onClick={savePaymentDrafts}
                        disabled={isPaymentSaving}
                        color="primary"
                    >
                        {SAVE_LABEL}
                    </Button>}
                    <Button onClick={() => setPaymentRow(null)}>
                        {CLOSE_LABEL}
                    </Button>
                </DialogActions>
            </Dialog>

            {isPrepaidOpen && <PrepaidModal
                isOpen={isPrepaidOpen}
                close={() => {
                    setIsPrepaidOpen(false)
                    setRow(null)
                }}
                preData={row}
                preId={prepaidId}
                history={props.history}
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

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
            }}>
                {hasMultipleStocks && <div style={{ flex: '1 1 280px', maxWidth: 420 }}>

                    <StocksSelect
                        stocks={selectableStocks}
                        stock={stock}
                        setStock={setStock}
                        classes={classes.controls}
                    />

                </div>}

                <div style={{ flex: '1 1 280px', maxWidth: hasMultipleStocks ? 420 : 520 }}>
                    <TextField
                        className={classes.controls}
                        variant="outlined"
                        disabled={false}
                        label="дата"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </div>
            </div>

            {date !== today && (!localDaily || !localDaily.hasOwnProperty('id'))
                ? <div style={{
                    margin: '1rem',
                    fontSize: 20
                }}>
                    Нет Данных
                </div>
                : <>
                    <div className="p-2">
                        <List dense>
                            {dailyEmployees.map(user => <ListItem
                                    key={'ListItem-users' + user.id}
                                    component={Paper}
                                    className="m-1"
                                >
                                    <ListItemText
                                        primary={user.name}
                                    />
                                    {(canAdminChange || +props.auth.user_id === +user.id) && <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() => employeeCheckout(user.id)}
                                        >
                                            <ExitToAppIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>}
                                </ListItem>)}
                        </List>
                    </div>

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
                            profit: canViewGoodsProfit ? salesProfit : null,
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
                            ? <div key={'key-in-titles-daily-tables' + t.title} />
                            : <div key={'key-in-titles-daily-tables' + t.title}
                                style={{ margin: '0 1rem 0 0' }}
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
                                                                <AddCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        : ''}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableHead>
                                            <TableRow>
                                                {t.titles.map(t => <TableCell
                                                    key={'titles-in-daily-rows' + t}
                                                >{t}</TableCell>)}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {t.rows.map(row => <InteractionTableRow
                                                key={'table-row-in-daily-' + row.id + row.created_at}
                                                row={row}
                                                values={t.rowsValues}
                                                users={appUsers}
                                                style={{cursor: 'pointer'}}
                                                onClick={() => handler(t.title, row)}
                                                getCellContent={({row, valueName, value}) => valueName === 'sum'
                                                    ? renderSumCell(row, value)
                                                    : value}
                                                getCellProps={({row, valueName}) => valueName === 'sum'
                                                    ? {
                                                        onClick: event => openPayments(event, row),
                                                        style: {
                                                            cursor: 'pointer',
                                                            fontWeight: 700,
                                                            textDecoration: 'underline',
                                                            textUnderlineOffset: 3,
                                                        },
                                                    }
                                                    : {}}
                                            />)}
                                        </TableBody>

                                        <TableHead>
                                            <TableRow>
                                                <TableCell colSpan={t.titles.length - 2}>
                                                    Итого:
                                                </TableCell>
                                                <TableCell>
                                                    {t.sum}
                                                </TableCell>
                                                {t.profit !== undefined && t.profit !== null
                                                    ? <TableCell align="right">
                                                        Прибыль: {t.profit}
                                                    </TableCell>
                                                    : null}
                                            </TableRow>
                                        </TableHead>

                                    </Table>
                                </TableContainer>
                            </div>)}


                    {daily && <div style={{ margin: '0 1rem 0 0' }}>
                        <TableContainer
                            className={classes.table}
                            component={Paper}
                        >
                            <Table size="small">
                                <TableBody>
                                    {[
                                        { text: 'Остаток на утро:', value: daily.morning },
                                        { text: 'Выручка:', value: daily.proceeds },
                                        { text: 'Подотчеты:', value: imprestsSum },
                                        ...cashlessTotalRows,
                                        {
                                            text: 'Сдали:', value: daily.handed,
                                            localValue: handed,
                                            change: e => numberInputHandler(e.target.value, setHanded),
                                            click: canAdminChange && handedHandler,
                                            clickAdd: canAdminChange && handedHandlerAdd
                                        },
                                        { text: 'Остаток:', value: daily.evening },
                                    ].map(l => (date === today || l.text !== 'Подотчеты:') && <React.Fragment
                                        key={'table-row-in-daily-' + l.text}
                                    >
                                        <TableRow>

                                            <TableCell style={{
                                                fontWeight: 'bold'
                                            }}>
                                                {l.text}
                                            </TableCell>

                                            <TableCell>
                                                {l.value}
                                                {l.warning && <Typography
                                                    variant="caption"
                                                    color="error"
                                                    style={{
                                                        display: 'block',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {l.warning}
                                                </Typography>}
                                            </TableCell>

                                            {l.click && <TableCell>

                                                <TextField
                                                    size="small"
                                                    value={l.localValue}
                                                    onChange={l.change}
                                                    slotProps={{
                                                        input: {
                                                            style: {
                                                                height: 30,
                                                            },
                                                        },
                                                        htmlInput: {
                                                            style: {
                                                                padding: '4px 8px',
                                                            },
                                                        },
                                                    }}
                                                    style={{
                                                        width: 110,
                                                        verticalAlign: 'middle',
                                                    }}
                                                />

                                                <IconButton
                                                    className={classes.icon}
                                                    onClick={l.click}
                                                    disabled={l.value === l.localValue}
                                                >
                                                    <SaveOutlinedIcon />
                                                </IconButton>
                                                <IconButton
                                                    className={classes.icon}
                                                    onClick={l.clickAdd}
                                                    disabled={l.localValue === 0}
                                                >
                                                    <AddCircleIcon />
                                                </IconButton>

                                            </TableCell>}

                                        </TableRow>
                                    </React.Fragment>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}

                    {unmatchedCashPaymentDiscrepancies.length > 0 && <div style={{ margin: '0 1rem 0 0' }}>
                        <TableContainer
                            className={classes.table}
                            component={Paper}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <Typography variant="h6">
                                                Проверка наличных оплат
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Время</TableCell>
                                        <TableCell>Статус</TableCell>
                                        <TableCell>Видео</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {unmatchedCashPaymentDiscrepancies.map(item => <TableRow
                                        key={'cash-payment-discrepancy-' + item.id}
                                    >
                                        <TableCell>{item.time}</TableCell>
                                        <TableCell>{item.status}</TableCell>
                                        <TableCell>
                                            {item.url
                                                ? <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    открыть
                                                </a>
                                                : ''}
                                        </TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}

                </>}
        </>

}

export default connect(state => state)(Daily)
