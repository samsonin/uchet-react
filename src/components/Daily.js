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
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
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


const PAYMENT_DIALOG_TITLE = '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u043e\u043f\u043b\u0430\u0442\u044b'
const PAYMENT_TYPE_LABEL = '\u0421\u043f\u043e\u0441\u043e\u0431'
const PAYMENT_SUM_LABEL = '\u0421\u0443\u043c\u043c\u0430'
const PAYMENT_EMPTY_LABEL = '\u0414\u0430\u043d\u043d\u044b\u0435 \u043f\u043e \u0441\u043f\u043e\u0441\u043e\u0431\u0430\u043c \u043e\u043f\u043b\u0430\u0442\u044b \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u044b'
const CLOSE_LABEL = '\u0417\u0430\u043a\u0440\u044b\u0442\u044c'
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'
const TOTAL_LABEL = '\u0418\u0442\u043e\u0433\u043e:'
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

const getRowPayments = (row, paymentTypes) => {
    const wf = parseMaybeJson(row?.wf)
    const payments = wf?.payments || {}
    const entries = Array.isArray(payments)
        ? payments.map(payment => [payment.payment_type_id || payment.id || payment.type_id, payment.sum])
        : Object.entries(payments)

    return entries
        .map(([id, sum]) => ({
            id,
            key: getPaymentKey(id),
            name: getPaymentTypeName(paymentTypes, id),
            sum: +sum || 0,
        }))
        .filter(payment => payment.id && payment.sum)
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

const buildPaymentsPayload = paymentRows => {
    const payments = paymentRows.reduce((acc, payment) => {
        if (payment.sum > 0) acc[payment.key === 'cash' ? 0 : payment.id] = payment.sum
        return acc
    }, {})

    return { payments }
}

const getPaymentDraftRows = (row, paymentTypes) => {
    const currentPayments = getRowPayments(row, paymentTypes)
    const paymentRows = paymentTypes
        .filter(type => type.is_active !== false)
        .map(type => {
            const current = currentPayments.find(payment => payment.key === getPaymentKey(type.id))

            return {
                id: type.id,
                key: getPaymentKey(type.id),
                name: type.name,
                sum: current ? current.sum : 0,
            }
        })

    currentPayments.forEach(payment => {
        if (payment.key === 'cash') return

        const existing = paymentRows.find(row => row.key === payment.key)

        if (existing) existing.sum = payment.sum
        else paymentRows.push(payment)
    })

    return paymentRows
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

    const [cashless, setCashless] = useState(0)
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
    const [isPaymentTotalsOpen, setPaymentTotalsOpen] = useState(false)
    const [isPaymentSaving, setPaymentSaving] = useState(false)

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

        rest('daily/' + stock + '/' + date)
            .then(res => {

                if (res.status === 200) {
                    setLocalDaily(res.body)
                } else {
                    setLocalDaily(null)
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
        ? appDaily.find(d => d.stock_id === stock)
        : localDaily

    const canChange = date === today && props.app.current_stock_id === stock

    const canAdminChange = date === today && props.auth.admin

    const afterRes = (res, local, text) => {

        if (res.status === 200) {

            local && local(0)

            enqueueSnackbar(text || 'ok', { variant: 'success' })

        } else {

            enqueueSnackbar('ошибка', { variant: 'error' })

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

    const cashlessHandler = () => cashlessRest({ cashless })

    const cashlessHandlerAdd = () => cashlessRest({ cashless: daily.cashless + +cashless })

    const handedHandler = () => handedRest(handed)

    const handedHandlerAdd = () => handedRest(daily.handed + +handed)

    const employeeCheckout = employee_id => {

        const employees = daily.employees.filter(e => e !== employee_id)

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
    const paymentTotals = getPaymentTotals(daily?.sales || [], appPaymentTypes)
    const hasPaymentTotalsDropdown = paymentTotals.length > 1

    let imprests = daily && daily.imprests
        ? daily.imprests
        : []

    let imprestsSum = 0

    imprests.map(i => imprestsSum += i.sum)

    let prepaidId
    if (row && row.wf) {
        try {
            prepaidId = row.wf.zakaz
        } catch (e) {
            console.log('JSON.parse.error', e)
        }
    }

    const paymentRows = paymentDrafts
    const paymentTotal = paymentRows.reduce((total, payment) => total + payment.sum, 0)
    const paymentExpectedTotal = paymentRow ? +paymentRow.sum || paymentTotal : paymentTotal
    const openPayments = (event, row) => {
        event.stopPropagation()
        setPaymentRow(row)
    }
    const changePaymentDraft = (id, value) => {
        const nextValue = Math.max(0, +value || 0)

        setPaymentDrafts(prev => {
            const rows = prev.map(payment => ({ ...payment }))
            const index = rows.findIndex(payment => payment.key === getPaymentKey(id))
            const adjustIndex = rows.findIndex((payment, i) => i !== index && payment.sum > 0)
            const fallbackAdjustIndex = rows.findIndex((payment, i) => i !== index)
            const targetAdjustIndex = adjustIndex >= 0 ? adjustIndex : fallbackAdjustIndex

            if (index < 0) return prev

            if (targetAdjustIndex < 0) {
                rows[index].sum = Math.min(nextValue, paymentExpectedTotal)
                return rows
            }

            const fixedOtherSum = rows.reduce((sum, payment, i) => i !== index && i !== targetAdjustIndex
                ? sum + payment.sum
                : sum, 0)
            const maxValue = Math.max(0, paymentExpectedTotal - fixedOtherSum)
            const nextSum = Math.min(nextValue, maxValue)

            rows[index].sum = nextSum
            rows[targetAdjustIndex].sum = Math.max(0, paymentExpectedTotal - fixedOtherSum - nextSum)

            return rows
        })
    }
    const savePaymentDrafts = () => {
        if (!paymentRow || isPaymentSaving) return

        const payload = buildPaymentsPayload(paymentDrafts)

        setPaymentSaving(true)

        rest('sales/' + stock + '/' + paymentRow.id, 'PATCH', payload)
            .then(res => {
                if (res.status === 200) {
                    const nextWf = {
                        ...parseMaybeJson(paymentRow.wf),
                        payments: payload.payments,
                    }

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
                open={Boolean(paymentRow)}
                onClose={() => setPaymentRow(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{PAYMENT_DIALOG_TITLE}</DialogTitle>
                <DialogContent>
                    {paymentRows.length
                        ? <Table size="small">
                            <TableBody>
                                {paymentRows.map(payment => <TableRow key={'daily-payment-row-' + payment.key}>
                                    <TableCell>{payment.name}</TableCell>
                                    <TableCell align="right">
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={payment.sum}
                                            onChange={event => changePaymentDraft(payment.id, event.target.value)}
                                            disabled={!canChange}
                                            slotProps={{ htmlInput: { min: 0 } }}
                                            style={{ width: 120 }}
                                        />
                                    </TableCell>
                                </TableRow>)}
                                <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>{TOTAL_LABEL}</TableCell>
                                    <TableCell align="right" style={{ fontWeight: 'bold' }}>{paymentExpectedTotal}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
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
                            {daily && daily.employees && daily.employees.map(e => {

                                const user = appUsers.find(u => u.id === e)

                                return user && <ListItem
                                    key={'ListItem-users' + user.id}
                                    component={Paper}
                                    className="m-1"
                                >
                                    <ListItemText
                                        primary={user.name}
                                    />
                                    {(canAdminChange || props.auth.user_id === user.id) && <ListItemSecondaryAction>
                                        <IconButton
                                            onClick={() => employeeCheckout(user.id)}
                                        >
                                            <ExitToAppIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>}
                                </ListItem>
                            })}
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
                                        {
                                            text: 'Безнал:', value: daily.cashless,
                                            localValue: cashless,
                                            change: e => numberInputHandler(e.target.value, setCashless),
                                            click: canChange && cashlessHandler,
                                            clickAdd: canChange && cashlessHandlerAdd,
                                            payments: true,
                                        },
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
                                                {l.payments && hasPaymentTotalsDropdown && <IconButton
                                                    className={classes.icon}
                                                    onClick={() => setPaymentTotalsOpen(open => !open)}
                                                    size="small"
                                                >
                                                    {isPaymentTotalsOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                                                </IconButton>}
                                                {l.text}
                                            </TableCell>

                                            <TableCell>
                                                {l.value}
                                            </TableCell>

                                            {l.click && <TableCell>

                                                <TextField
                                                    value={l.localValue}
                                                    onChange={l.change}
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
                                        {l.payments && hasPaymentTotalsDropdown && <TableRow>
                                            <TableCell colSpan={3} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                <Collapse in={isPaymentTotalsOpen} timeout="auto" unmountOnExit>
                                                    <Table size="small">
                                                        <TableBody>
                                                            {paymentTotals.map(payment => <TableRow key={'daily-payment-total-' + payment.key}>
                                                                <TableCell>{payment.name}</TableCell>
                                                                <TableCell align="right">{payment.sum}</TableCell>
                                                            </TableRow>)}
                                                        </TableBody>
                                                    </Table>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>}
                                    </React.Fragment>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>}

                </>}
        </>

}

export default connect(state => state)(Daily)
