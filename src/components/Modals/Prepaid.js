import React, {forwardRef, useEffect, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import {useSnackbar} from "notistack";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from "@mui/icons-material/Close";
import {makeStyles} from "muiLegacyStyles";

import CustomersSelect from "../common/CustomersSelect"
import TextField from "@mui/material/TextField";
import {connect} from "react-redux";

import {Print, createDate} from "../common/Print"
import {sumField} from "../common/InputHandlers";
import QuickTextField from "../common/QuickTextField";
import {getQuickTextOptions} from "../common/quickTexts";
import {buildPrepaidOrderDraft, buildPrepaidOrderPayload} from "./prepaidOrder";

const statuses = [
    'Новая',
    'Заказали',
    'В магазине',
    'Ждем Клиента',
    'Надо заказать'
]

const isEditableStatus = status => {

    status = status.charAt(0).toUpperCase() + status.slice(1);

    if (!status || status === 'New') return true

    return statuses.includes(status)

}

const notEditableStatuses = {
    refund: 'Возвращена',
    left: 'Списана',
    rem: 'В ремонте',
    sale: 'Продали'
}

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '0 !important',
        width: '100%'
    },
    title: {
        padding: '1rem 1.2rem 0.85rem !important',
    },
    content: {
        display: 'grid',
        gap: '0.9rem',
        padding: '1rem 1.2rem 0.75rem !important',
        minWidth: 'min(92vw, 420px)'
    },
    actions: {
        padding: '0.75rem 1.2rem 1rem !important',
        gap: '0.65rem'
    },
    titleBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        paddingRight: theme.spacing(1),
    },
    titleText: {
        fontWeight: 700,
    },
    titleActions: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        flexShrink: 0,
    },
    closeButton: {
        color: theme.palette.grey[500],
    },
    printButton: {
        color: 'inherit',
    }
}));

const initCustomer = {
    id: 0,
    phone_number: '',
    fio: '',
}

const initPrepaid = 'Предоплата'
const initSum = 'Окончательная стоимость'

const Prepaid = props => {

    const classes = useStyles()
    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [id, setId] = useState(0)
    const [created, setCreated] = useState('')
    const [item, setItem] = useState('')
    const [presum, setPresum] = useState(initPrepaid)
    const [sum, setSum] = useState(initSum)
    const [customer, setCustomer] = useState(initCustomer)
    const [status, setStatus] = useState(statuses[0])
    const [note, setNote] = useState('')

    const [disabled, setDisabled] = useState(false)
    const quickTextOptions = path => getQuickTextOptions(props.app.quick_texts, path)

    const reset = () => {
        setId(0)
        setCreated('')
        setItem('')
        setPresum(initPrepaid)
        setSum(initSum)
        setCustomer(initCustomer)
        setStatus(statuses[0])
        setNote('')
    }

    useEffect(() => {

        if (props.preId && props.isOpen) {

            setDisabled(true)

            if (props.preData) {
                setItem(props.preData.item)
                setPresum(props.preData.sum)
                setNote(props.preData.note)
            }

            rest('zakaz/' + props.preId)
                .then(res => {
                    if (res.status === 200 && res.body) {

                        const status = res.body.status === 'new' ? 'Новая' : res.body.status

                        setDisabled(!isEditableStatus(status))

                        setId(+props.preId || res.body.id)
                        setCreated(res.body.time.substring(0, 10))
                        setItem(res.body.item)
                        setPresum(res.body.presum)
                        setSum(res.body.sum)
                        setStatus(status)
                        if (res.body.customer) setCustomer(res.body.customer)
                        setNote(res.body.note)

                    }
                })

        } else {
            reset()
        }

    }, [props.preData, props.isOpen])

    const doc = props.app.docs.find(d => d.name === 'prepaid')

    const buildAlias = (overrides = {}) => ({
        organization_organization: props.app.organization.organization,
        organization_legal_address: props.app.organization.legal_address,
        organization_inn: props.app.organization.inn,
        today: createDate(overrides.created || created),
        fio: overrides.customer?.fio || customer.fio,
        model: overrides.item ?? item,
        sum: overrides.sum ?? sum,
        presum: overrides.presum ?? presum
    })

    const printPrepaid = (overrides = {}) => Print(doc, buildAlias(overrides))

    const sendRest = (shouldPrint = false) => {

        let url = 'zakaz/' + props.app.current_stock_id
        const data = {item, presum, sum, customer, status, note}

        if (id) url += '/' + id

        setDisabled(true)

        rest(url, id ? 'PATCH' : 'POST', data)
            .then(res => {

                    setDisabled(false)

                    if (res.status === 200) {

                        if (props.setPrepaids && res.body.prepaids) props.setPrepaids(res.body.prepaids)

                        if (!id || shouldPrint) printPrepaid(res.body || {})

                        exit()

                    } else {

                        enqueueSnackbar((res.status || '') + ' ' + (res.body
                            ? Object.keys(res.body)[0].toString() + ' ' + res.body[Object.keys(res.body)[0]]
                            : 'error'),
                            {variant: 'error'}
                        )

                    }

                }
            )

    }

    const save = (afterCheckPhoneNumber, shouldPrint = false) => {

        let error;

        if (!item) error = 'Укажите наименование'
        else if (customer === initCustomer) error = 'Не указан заказчик'
        else if (!afterCheckPhoneNumber && !customer.phone_number) {

            error = 'Не указан номер телефона заказчика'

            const action = key => (
                <>
                    <Button onClick={() => save(true)}>
                        Внести
                    </Button>
                    <Button onClick={() => closeSnackbar(key)}>
                        Отмена
                    </Button>
                </>
            )

            return enqueueSnackbar(error, {
                variant: 'warning',
                autoHideDuration: 5000,
                action,
            })

        } else if (sum < 1) error = 'Окончательная стоимость должна быть больше 0'

        if (error) return enqueueSnackbar(error, {variant: 'error'})

        sendRest(shouldPrint)

    }

    const del = () => {

        rest('zakaz/' + props.app.current_stock_id + '/' + id, 'DELETE')
            .then(res => {

                if (res.status === 200) {
                    enqueueSnackbar('возврат записан', {variant: 'success'})
                    exit()
                } else {
                    enqueueSnackbar('ошибка', {variant: 'error'})
                }

            })

    }

    const createOrder = () => {
        if (!id) {
            return enqueueSnackbar('Сначала сохраните предоплату', {variant: 'warning'})
        }

        if (!props.history?.push) {
            return enqueueSnackbar('Не удалось открыть форму заказа', {variant: 'error'})
        }

        const prepaid = buildPrepaidOrderPayload({
            id,
            created,
            item,
            presum,
            sum,
            customer,
            status,
            note
        })

        rest('zakaz/' + props.app.current_stock_id + '/' + id, 'DELETE')
            .then(res => {
                if (res.status === 200) {
                    if (props.setPrepaids && res.body?.prepaids) props.setPrepaids(res.body.prepaids)

                    props.history.push('/order', {
                        prepaidOrder: buildPrepaidOrderDraft(prepaid)
                    })

                    exit()
                } else {
                    enqueueSnackbar('ошибка ' + (res.status || ''), {variant: 'error'})
                }
            })
    }
    const exit = () => {

        reset()
        props.close()

    }

    return <Dialog
        open={props.isOpen}
        slots={{ transition: Transition }}
        keepMounted
        onClose={() => exit()}
        className='non-printable'
    >
        <DialogTitle className={classes.title}>
            <div className={classes.titleBar}>
                <span className={classes.titleText}>Предоплата</span>
                <div className={classes.titleActions}>
                    <IconButton
                        className={classes.printButton}
                        disabled={disabled}
                        onClick={() => id ? printPrepaid() : save(false, true)}
                    >
                        <PrintIcon/>
                    </IconButton>

                    <IconButton aria-label="close" className={classes.closeButton}
                                onClick={() => props.close()}>
                        <CloseIcon/>
                    </IconButton>
                </div>
            </div>
        </DialogTitle>

        <DialogContent className={classes.content}>

            {created
                ? <DialogContentText>
                    {'#' + id + ' от ' + created}
                </DialogContentText>
                : null}

            <QuickTextField label="Наименование"
                            disabled={disabled}
                            className={classes.field}
                            value={item}
                            onChange={setItem}
                            options={quickTextOptions('preorders.items')}
            />

            {sumField(initPrepaid, presum, setPresum, {
                margin: '0',
                width: '100%'
            }, disabled)}

            {sumField(initSum, sum, setSum, {
                margin: '0',
                width: '100%'
            }, disabled)}

            <CustomersSelect
                customer={customer}
                setCustomer={setCustomer}
                disabled={disabled}
            />

            {id
                ? isEditableStatus(status)
                    ? <FormControl className={classes.field}>
                        <InputLabel id="prepaid-status-control-select-label">
                            Статус
                        </InputLabel>
                        <Select
                            labelId="prepaid-status-control-select-label"
                            disabled={disabled}
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            label="Статус"
                        >
                            {statuses.map(s => <MenuItem key={'menustatusinprepaidkey' + s}
                                                         value={s}>
                                {s}
                            </MenuItem>)}
                        </Select>
                    </FormControl>
                    : <TextField
                        label="Статус"
                        disabled={disabled}
                        className={classes.field}
                        value={notEditableStatuses[status] || 'Не определен'}
                    />
                : ''}

            <QuickTextField label="Примечание"
                            disabled={disabled}
                            className={classes.field}
                            value={note}
                            onChange={setNote}
                            options={quickTextOptions('preorders.notes')}
            />

        </DialogContent>

        {disabled
            ? ''
            : <DialogActions className={classes.actions}>
                <Button onClick={() => id
                    ? del()
                    : exit()}
                        color="secondary">
                    {id
                        ? 'Вернуть'
                        : 'Отмена'}
                </Button>
                <Button onClick={() => save()}
                        color="primary">
                    {id
                        ? 'Сохранить'
                        : 'Внести'}
                </Button>
                <Button
                    onClick={() => createOrder()}
                    color="primary"
                    disabled={!id}
                >
                    В заказ
                </Button>
            </DialogActions>
        }

    </Dialog>
}

export default connect(state => state)(Prepaid)
