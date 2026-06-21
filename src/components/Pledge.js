import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { connect } from "react-redux";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { intInputHandler } from "./common/InputHandlers";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from "notistack";
import Fields from "./customer/Fields";
import rest from "./Rest";
import { createDate, Print } from "./common/Print";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import { makeStyles } from "muiLegacyStyles";
import Slide from "@mui/material/Slide";
import Paper from "@mui/material/Paper";
import InteractionTableRow from "./common/InteractionTableRow";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',
        width: '100%'
    },
}));


const Pledge = props => {
    const appStocks = props.app.stocks || []
    const appDocs = props.app.docs || []
    const organization = props.app.organization || {}

    const pledge = props.current
    const classes = useStyles()

    const stock = appStocks.find(s => s.id === pledge.stock)
    const normalizedStatus = String(pledge.status || '').toLowerCase()
    const isNewStatus = !pledge.id || ['new', 'новая'].includes(normalizedStatus)
    const isSameStock = pledge.stock === props.app.current_stock_id
    const canEditPledge = !props.viewOnly && (!pledge.id || (isNewStatus && isSameStock))
    const timeZone = stock ? stock.timezone_offset : 0
    const isDelay = pledge.ransomdate
        ? (Date.now() - Date.parse(pledge.ransomdate)) / 3600000 + timeZone > 24
        : false
    const pledgeSales = Array.isArray(pledge.sales)
        ? [...pledge.sales].sort((a, b) => Date.parse(a.created_at || 0) - Date.parse(b.created_at || 0))
        : []
    const hasSalesHistory = pledgeSales.length > 0

    const { enqueueSnackbar } = useSnackbar()

    const needPrint = useRef(false)

    const [isOpen, setIsOpen] = useState(false)

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const full = d => d < 10 ? '0' + d : d
    const nextDay = date.getFullYear() + '-' + full(1 + date.getMonth()) + '-' + full(date.getDate())

    const [customer, setCustomer] = useState(pledge.customer ? pledge.customer : {})
    const [model, setModel] = useState(pledge.model ?? '')
    const [imei, setImei] = useState(pledge.imei ?? '')
    const [password, setPassword] = useState(pledge.password ?? '')
    const [sum, setSum] = useState(pledge.sum ?? 0)
    const [sum2, setSum2] = useState(pledge.sum2 ?? 0)
    const [ransomdate, setRansomdate] = useState(pledge.ransomdate ?? nextDay)
    const [note, setNote] = useState(pledge.note ?? '')

    const [prolongDate, setProlongDate] = useState(nextDay)
    const [prolongSum, setProlongSum] = useState(sum2)

    useEffect(() => {
        setCustomer(pledge.customer ? pledge.customer : {})
        setModel(pledge.model ?? '')
        setImei(pledge.imei ?? '')
        setPassword(pledge.password ?? '')
        setSum(pledge.sum ?? 0)
        setSum2(pledge.sum2 ?? 0)
        setRansomdate(pledge.ransomdate ?? nextDay)
        setNote(pledge.note ?? '')
        setProlongDate(nextDay)
        setProlongSum(pledge.sum2 ?? 0)
    }, [pledge, nextDay])

    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    const salesHistoryValue = (row, valueName) => {
        if (valueName === 'date') return String(row.created_at || '').slice(0, 16)
        return row[valueName] ?? ''
    }

    const doc = appDocs.find(d => d.name === 'zalog')

    const alias = pledge.id
        ? {
            organization_organization: organization.organization || '',
            organization_legal_address: organization.legal_address || '',
            organization_inn: organization.inn || '',
            access_point_address: stock?.address || '',
            access_point_phone_number: stock?.phone_number || '',
            today: createDate(pledge.time),
            fio: pledge.customer?.fio || '',
            phone_number: pledge.customer?.phone_number || '',
            birthday: pledge.customer?.birthday ? createDate(pledge.customer.birthday) : '',
            doc_sn: pledge.customer?.doc_sn || '',
            doc_date: pledge.customer?.doc_date ? createDate(pledge.customer.doc_date) : '',
            doc_division_name: pledge.customer?.doc_division_name || '',
            address: pledge.customer?.address || '',
            model: pledge.model,
            imei: pledge.imei,
            password: pledge.password,
            sum: pledge.sum,
            sum2: pledge.sum2,
            ransomdate: createDate(pledge.ransomdate),
        }
        : {}

    useEffect(() => {

        if (pledge.id && needPrint.current) {
            needPrint.current = false
            Print(doc, alias)
        }

    }, [pledge.id, pledge.ransomdate])

    const create = () => {

        let error = ''
        if (!customer.fio) error = 'ФИО'
        else if (!model) error = 'наименование'
        else if (!imei) error = 'imei или S/N'
        else if (!sum) error = 'сумму залога'
        else if (!password) error = 'пароль'

        if (error) return enqueueSnackbar('введите ' + error, {
            variant: 'error'
        })

        const data = {
            customer,
            model,
            imei,
            password,
            sum,
            sum2,
            ransomdate,
            note
        }

        rest('pledges/' + props.app.current_stock_id, 'POST', data)
            .then(res => {

                if (res.status === 200 && res.body.pledge) {

                    props.addPledge(res.body.pledge)

                    needPrint.current = true

                }

            })


    }

    const save = () => {

        rest('pledges/' + props.app.current_stock_id + '/' + pledge.id, 'PATCH', { note })
            .then(res => {

                if (res.status === 200) {
                    props.updPledge(res.body.pledge)
                }

            })

    }

    const prolong = () => {

        rest('pledges/' + props.app.current_stock_id + '/' + pledge.id + '/prolong', 'PATCH', {
            date: prolongDate,
            sum: checkoutSum() - pledge.sum,
            sum2: prolongSum
        })
            .then(res => {

                if (res.status === 200) {

                    const newPledge = res.body.pledge

                    setIsOpen(false)
                    props.updPledge(newPledge)

                    needPrint.current = true

                    setRansomdate(newPledge.ransomdate)
                    setSum2(newPledge.sum2)

                }

            })

    }

    const checkout = isToSale => {

        rest('pledges/' + props.app.current_stock_id + '/' + pledge.id + '/' + (isToSale ? 'toSale' : checkoutSum()),
            'DELETE')
            .then(res => {

                if (res.status === 200 || res.status === 201) {

                    props.delPledge(pledge.id)

                }

            })

    }

    useEffect(() => {

        if (pledge.id && pledge.sum2) return

        const r = Date.parse(ransomdate)
        const n = Date.now()
        const sum2 = props.getSum2(n, r, sum)

        setSum2(sum2)

    }, [sum, ransomdate])

    useEffect(() => {

        if (!pledge.id) return

        const r = Date.parse(prolongDate)
        const n = Date.now()
        const prolongSum = props.getSum2(n, r, sum)

        setProlongSum(prolongSum)

    }, [prolongDate])

    const dateHandler = (date, setFunction) => date < nextDay || setFunction(date)

    const checkoutSum = () => {

        if (!isDelay) return sum2

        const date1 = Date.parse(pledge.time)
        const date2 = Date.now()

        return props.getSum2(date1, date2, sum)

    }

    const mb = (value, onClick, icon = null) => <Button size="small"
        color="primary"
        variant="contained"
        startIcon={icon}
        onClick={onClick}>
        {value}
    </Button>

    const renderId = () => {

        const st = props.app.stocks.find(s => s.id === props.app.current_stock_id)

        return pledge.id
            ? !st || pledge.stock !== st.id
                ? stock.name + ' #' + pledge.id
                : '#' + pledge.id
            : null
    }

    return <>

        <Dialog
            open={isOpen}
            slots={{ transition: Transition }}
            keepMounted
            onClose={() => setIsOpen(false)}
            className='non-printable'
        >

            <DialogContent>

                <div style={{
                    margin: '.5rem',
                    padding: '.5rem',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center'
                }}>
                    Необходимо оплатить: <span style={{
                        fontWeight: 'bold',
                    }}>
                        {checkoutSum() - pledge.sum}
                    </span>
                </div>

                <TextField label="Продлить до"
                    className={classes.field}
                    type="date"
                    value={prolongDate}
                    onChange={e => dateHandler(e.target.value, setProlongDate)}
                />

                <TextField label="Новая сумма выкупа"
                    className={classes.field}
                    value={prolongSum}
                    onChange={e => intInputHandler(e.target.value, setProlongSum)}
                />

            </DialogContent>

            <DialogActions>
                <Button onClick={() => setIsOpen(false)}
                    color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => prolong()}
                    color="primary">
                    Оплатить
                </Button>
            </DialogActions>

        </Dialog>

        <div className="pledge-page" style={{
            padding: '0 1rem 0 0',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--line)',
            borderRadius: 3
        }}>

            <div style={{
                margin: '.1rem',
                padding: '.1rem',
                display: "flex",
                justifyContent: 'space-between',
            }}>

                <IconButton onClick={() => props.setCurrent(false)}>
                    <ArrowBackIcon />
                </IconButton>

                <span style={{
                    fontSize: 20, fontWeight: 'bold',
                }}>
                    Залог
                </span>

                <span style={{
                    fontSize: 20, fontWeight: 'bold',
                }}>
                    {renderId()}
                </span>

                {pledge.id && isNewStatus &&
                    <IconButton
                        onClick={() => Print(doc, alias)}
                    >
                        <PrintIcon />
                    </IconButton>}

            </div>

            <Fields
                customer={customer}
                setCustomer={setCustomer}
                enablePassportOcr
                disabled={props.viewOnly}
            />

            <TextField label="Наименование"
                style={fieldsStyle}
                value={model}
                disabled={props.viewOnly}
                onChange={e => pledge.id ? {} : setModel(e.target.value)}
            />

            <TextField label="Imei или S/N"
                style={fieldsStyle}
                value={imei}
                disabled={props.viewOnly}
                onChange={e => pledge.id ? {} : setImei(e.target.value)}
            />

            <TextField label="Пароль"
                style={fieldsStyle}
                value={password}
                disabled={props.viewOnly}
                onChange={e => pledge.id ? {} : setPassword(e.target.value)}
            />

            {hasSalesHistory && <TableContainer component={Paper} className="pledge-sales-history">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Дата</TableCell>
                            <TableCell>Действие</TableCell>
                            <TableCell>Сумма</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pledgeSales.map(row => <InteractionTableRow
                            key={'pledge-sales-history-row-' + row.id}
                            row={row}
                            values={['date', 'action', 'sum']}
                            getValue={({row, valueName}) => salesHistoryValue(row, valueName)}
                            cellKeyPrefix="pledge-sales-history-cell"
                        />)}
                    </TableBody>
                </Table>
            </TableContainer>}

            {pledge.time && !hasSalesHistory && <TextField label="Дата залога"
                style={fieldsStyle}
                type="date"
                value={pledge.time.substring(0, 10)}
            />}

            {!hasSalesHistory && <TextField label="Сумма залога"
                style={fieldsStyle}
                value={sum}
                onChange={e => pledge.id || intInputHandler(e.target.value, setSum)}
            />}

            {!hasSalesHistory && <TextField label="Дата выкупа"
                style={fieldsStyle}
                type="date"
                value={ransomdate}
                error={isDelay}
                onChange={e => pledge.id || dateHandler(e.target.value, setRansomdate)}
            />}

            {!hasSalesHistory && <TextField label="Сумма выкупа"
                style={fieldsStyle}
                value={checkoutSum()}
                error={isDelay}
                onChange={e => pledge.id ? {} : intInputHandler(e.target.value, setSum2)}
            />}

            <TextField label="Примечание"
                style={fieldsStyle}
                value={note}
                disabled={props.viewOnly}
                onChange={e => setNote(e.target.value)}
            />

            {props.viewOnly && props.copyPledge
                ? <div style={{
                    padding: '.3rem',
                    display: "flex",
                    justifyContent: 'space-around'
                }}>
                    {mb('Копировать', () => props.copyPledge(pledge), <ContentCopyIcon />)}
                </div>
                : null}

            {props.app.current_stock_id && canEditPledge
                ? <div style={{
                    padding: '.3rem',
                    display: "flex",
                    justifyContent: 'space-around'
                }}>
                    {isSameStock
                        ? <>
                            {note === pledge.note || mb('Сохранить', () => save())}
                            {mb('Выкупают', () => checkout())}
                            {mb('Продлить', () => setIsOpen(true))}
                            {isDelay && mb('На продажу', () => checkout(true))}
                        </>
                        : mb('Принять в залог', () => create())}
                </div>
                : null}

        </div>

    </>
}

export default connect(state => state)(Pledge)
