import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {connect} from "react-redux";
import {Button, TextField} from "@material-ui/core";
import {intInputHandler} from "./common/InputHandlers";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import PrintIcon from '@material-ui/icons/Print';
import {useSnackbar} from "notistack";
import Fields from "./customer/Fields";
import rest from "./Rest";
import {createDate, Print} from "./common/Print";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {makeStyles} from "@material-ui/core/styles";
import Slide from "@material-ui/core/Slide";


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

    const pledge = props.current
    const classes = useStyles()

    const stock = props.app.stocks.find(s => s.id === pledge.stock)
    const timeZone = stock ? stock.timezone_offset : 0
    const isDelay = pledge.ransomdate
        ? (Date.now() - Date.parse(pledge.ransomdate)) / 3600000 + timeZone > 24
        : false

    const {enqueueSnackbar} = useSnackbar()

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

    const fieldsStyle = {
        margin: '.4rem',
        width: '100%',
    }

    const doc = props.app.docs.find(d => d.name === 'zalog')

    const alias = pledge.id
        ? {
            organization_organization: props.app.organization.organization,
            organization_legal_address: props.app.organization.legal_address,
            organization_inn: props.app.organization.inn,
            today: createDate(pledge.time),
            fio: pledge.customer.fio,
            phone_number: pledge.customer.phone_number,
            birthday: pledge.customer.birthday ? createDate(pledge.customer.birthday) : '',
            doc_sn: pledge.customer.doc_sn,
            doc_date: pledge.customer.doc_date ? createDate(pledge.customer.doc_date) : '',
            doc_division_name: pledge.customer.doc_division_name,
            address: pledge.customer.address,
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

    }, [pledge.id])

    const create = () => {

        let error = ''
        if (!customer.fio) error = 'ФИО'
        else if (!model) error = 'наменование'
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

        rest('pledges/' + props.app.stock_id, 'POST', data)
            .then(res => {

                if (res.status === 200 && res.body.pledge) {

                    props.addPledge(res.body.pledge)

                    needPrint.current = true

                }

            })


    }

    const save = () => {

        rest('pledges/' + props.app.stock_id + '/' + pledge.id, 'PATCH', {note})
            .then(res => {

                if (res.status === 200) {
                    props.updPledge(res.body.pledge)
                }

            })

    }

    const prolong = () => {


    }

    const checkout = isToSale => {

        rest('pledges/' + props.app.stock_id + '/' + pledge.id + '/' + (isToSale ? 'toSale' : sum2), 'DELETE')
            .then(res => {

                if (res.status === 200 || res.status === 201) {
                    props.delPledge(pledge.id)
                }

            })

    }

    const handleChange = (name, value) => {

        if (customer.id) return

        const newCustomer = {...customer}
        newCustomer[name] = value
        setCustomer(newCustomer)

    }

    const getSum2 = (date1, date2, sum) => {

        const days = Math.ceil((date2 - date1) / 86400000)

        const min = +props.app.config.zalog_min_sum ?? 500
        const percent = +props.app.config.zalog_day_percent ?? 3

        const daily = sum * percent / 100
        const prof = daily * days

        return 50 * Math.round((sum + (min < prof ? prof : min)) / 50)

    }

    useEffect(() => {

        if (pledge.id && pledge.sum2) return

        const r = Date.parse(ransomdate)
        const n = Date.now()
        const sum2 = getSum2(n, r, sum)

        setSum2(sum2)

    }, [sum, ransomdate])

    const ransomSumHandler = sum => {

        if (pledge.id) return

        intInputHandler(sum, setSum)

    }
// TODO исправить
    const dateHandler = (date, setFunction) => {

        if (pledge.id || date < nextDay) return

        setFunction(date)

    }

    const checkoutSum = () => {

        if (!isDelay) return sum2

        const date1 = Date.parse(pledge.time)
        const date2 = Date.now()

        return getSum2(date1, date2, sum)

    }

    const mb = (value, onClick) => <Button size="small"
                                           color="primary"
                                           variant="contained"
                                           onClick={onClick}>
        {value}
    </Button>

    const renderId = () => {

        const st = props.app.stocks.find(s => s.id === props.app.stock_id)

        return pledge.id
            ? !st || pledge.stock !== st.id
                ? stock.name + ' #' + pledge.id
                : '#' + pledge.id
            : null
    }

    return <>

        <Dialog
            open={isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setIsOpen(false)}
            className='non-printable'
        >

            <DialogContent>

                <div style={{
                    margin: '.5rem',
                    padding: '.5rem',
                }}>
                    Для продления необходимо оплатить {checkoutSum() - pledge.sum}
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

        <div style={{
            padding: '0 1rem 0 0',
            background: '#fff',
            borderRadius: 3
        }}>

            <div style={{
                margin: '.1rem',
                padding: '.1rem',
                display: "flex",
                justifyContent: 'space-between',
            }}>

                <IconButton onClick={() => props.setCurrent(false)}>
                    <ArrowBackIcon/>
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

                {pledge.id && pledge.status === 'new' && pledge.stock === props.app.stock_id &&
                    <IconButton
                        onClick={() => Print(doc, alias)}
                    >
                        <PrintIcon/>
                    </IconButton>}

            </div>

            <Fields
                customer={customer}
                setCustomer={setCustomer}
                handleChange={handleChange}
                fieldsStyle={fieldsStyle}
            />

            <TextField label="Наименование"
                       style={fieldsStyle}
                       value={model}
                       onChange={e => pledge.id ? {} : setModel(e.target.value)}
            />

            <TextField label="Imei или S/N"
                       style={fieldsStyle}
                       value={imei}
                       onChange={e => pledge.id ? {} : setImei(e.target.value)}
            />

            <TextField label="Пароль"
                       style={fieldsStyle}
                       value={password}
                       onChange={e => pledge.id ? {} : setPassword(e.target.value)}
            />

            {pledge.time && <TextField label="Дата залога"
                                       style={fieldsStyle}
                                       type="date"
                                       value={pledge.time.substring(0, 10)}
            />}

            <TextField label="Сумма залога"
                       style={fieldsStyle}
                       value={sum}
                       onChange={e => ransomSumHandler(e.target.value)}
            />

            <TextField label="Дата выкупа"
                       style={fieldsStyle}
                       type="date"
                       value={ransomdate}
                       error={isDelay}
                       onChange={e => dateHandler(e.target.value, setRansomdate)}
            />

            <TextField label="Сумма выкупа"
                       style={fieldsStyle}
                       value={checkoutSum()}
                       error={isDelay}
                       onChange={e => pledge.id ? {} : intInputHandler(e.target.value, setSum2)}
            />

            <TextField label="Примечание"
                       style={fieldsStyle}
                       value={note}
                       onChange={e => setNote(e.target.value)}
            />

            {props.app.stock_id && <div style={{
                padding: '.3rem',
                display: "flex",
                justifyContent: 'space-around'
            }}>
                {pledge.stock === props.app.stock_id
                    ? <>
                        {note === pledge.note || mb('Сохранить', () => save())}
                        {mb('Выкупают', () => checkout())}
                        {mb('Продлить', () => setIsOpen(true))}
                        {isDelay && mb('На продажу', () => checkout(true))}
                    </>
                    : mb('Принять в залог', () => create())}
            </div>}

        </div>

    </>
}

export default connect(state => state)(Pledge)