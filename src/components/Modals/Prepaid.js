import React, {forwardRef, useEffect, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from '@material-ui/icons/Print';
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";

import CustomersSelect from "../common/CustomersSelect"
import TextField from "@material-ui/core/TextField/TextField";
import {connect} from "react-redux";

import {Print, createDate} from "../common/Print"

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
        margin: '1rem .3rem',
        width: '100%'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    printButton: {
        position: 'absolute',
        right: '4rem',
        top: theme.spacing(1),
    }
}));

const initCustomer = {
    id: 0,
    phone_number: '',
    fio: '',
}

const fields = ['id', 'fio', 'phone_number']

const Prepaid = props => {

    const classes = useStyles()
    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [saleId, setSaleId] = useState(0)
    const [id, setId] = useState(0)
    const [created, setCreated] = useState('')
    const [item, setItem] = useState('')
    const [presum, setPresum] = useState(0)
    const [sum, setSum] = useState(0)
    const [customer, setCustomer] = useState(initCustomer)
    const [status, setStatus] = useState(statuses[0])
    const [note, setNote] = useState('')

    const [disabled, setDisabled] = useState(false)

    const reset = () => {
        setSaleId(0)
        setId(0)
        setCreated('')
        setItem('')
        setPresum(0)
        setSum(0)
        setCustomer(initCustomer)
        setStatus(statuses[0])
        setNote('')
    }

    useEffect(() => {

        if (props.preId && props.isOpen) {

            setDisabled(true)

            if (props.preData) {
                setSaleId(props.preData.id)
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
                        setCreated(res.body.time.substr(0, 10))
                        setItem(res.body.item)
                        setPresum(res.body.presum)
                        setSum(res.body.sum)
                        setStatus(status)
                        if (res.body.customer) fields.map(f => updateCustomer(f, res.body.customer[f]))
                        setNote(res.body.note)

                    }
                })

        } else {
            reset()
        }

    }, [props.preData, props.isOpen])

    const doc = props.app.docs.find(d => d.name === 'prepaid')

    const sendRest = () => {

        let url = 'zakaz/' + props.app.stock_id
        const data = {item, presum, sum, customer, status, note}

        if (id) url += '/' + id
        if (saleId) data.sale_id = saleId

        setDisabled(true)

        rest(url, id ? 'PATCH' : 'POST', data)
            .then(res => {

                    setDisabled(false)

                    if (res.status === 200) {

                        if (props.setPrepaids && res.body.prepaids) props.setPrepaids(res.body.prepaids)

                        if (!id) Print(doc, inputToText)

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

    const save = afterCheckPhoneNumber => {

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

        sendRest()

    }

    const del = () => {

        rest('zakaz/' + props.app.stock_id + '/' + id, 'DELETE')
            .then(res => {

                if (res.status === 200) {
                    enqueueSnackbar('возврат записан', {variant: 'success'})
                    exit()
                } else {
                    enqueueSnackbar('ошибка', {variant: 'error'})
                }

            })

    }

    const exit = () => {

        reset()
        props.close()

    }

    const updateCustomer = (name, val) => {

        setCustomer(prev => {

            const newState = {...prev}
            newState[name] = val
            return newState

        })

    }
    const inputToText = elem => {

        const inputs = elem.querySelectorAll('input')

        for (let i of inputs) {

            let span = document.createElement('span')

            let value
            if (i.name === 'organization_organization') {
                value = props.app.organization.organization
            } else if (i.name === 'organization_inn') {
                value = props.app.organization.inn
            } else if (i.name === 'today') {
                value = createDate(created)
            } else if (i.name === 'fio') {
                value = customer.fio
            } else if (i.name === 'model') {
                value = item
            } else if (i.name === 'sum') {
                value = sum
            } else if (i.name === 'presum') {
                value = presum
            }

            span.innerHTML = value

            i.parentNode.replaceChild(span, i)

        }

        return elem
    }

    return <Dialog
        open={props.isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => exit()}
        className='non-printable'
    >
        <DialogTitle>

            Предоплата

            <IconButton className={classes.printButton}
                        disabled={!id}
                        onClick={() => Print(doc, inputToText)}
            >
                <PrintIcon/>
            </IconButton>

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <DialogContent>

            {created
                ? <DialogContentText>
                    {'#' + id + ' от ' + created}
                </DialogContentText>
                : null}

            <TextField label="Наименование"
                       disabled={disabled}
                       className={classes.field}
                       value={item}
                       onChange={e => setItem(e.target.value)}
            />

            <TextField label="Предоплата"
                       type="number"
                       disabled={disabled}
                       className={classes.field}
                       value={presum}
                       onChange={e => setPresum(+e.target.value)}
            />

            <TextField label="Окончательная стоимость"
                       type="number"
                       disabled={disabled}
                       className={classes.field}
                       value={sum}
                       onChange={e => setSum(+e.target.value)}
            />

            <CustomersSelect
                customer={customer}
                disabled={disabled}
                updateCustomer={updateCustomer}
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

            <TextField label="Примечание"
                       disabled={disabled}
                       className={classes.field}
                       value={note}
                       onChange={e => setNote(e.target.value)}
            />

        </DialogContent>

        {disabled
            ? ''
            : <DialogActions>
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
            </DialogActions>
        }

    </Dialog>
}

export default connect(state => state)(Prepaid)