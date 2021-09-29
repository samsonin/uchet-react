import React, {forwardRef, useEffect, useRef, useState} from "react";

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
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";

import CustomersSelect from "../common/CustomersSelect"
import TextField from "@material-ui/core/TextField/TextField";

const statuses = [
    'Новая',
    'Заказали',
    'В магазине',
    'Ждем Клиента',
    'Надо заказать'
]

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
    }
}));

const needleCustomerFields = ['id', 'fio', 'phone_number']

const initCustomer = {
    id: 0,
    phone_number: '',
    fio: '',
}

const zakaz = {
    sale_id: 0, // если редактируется
    id: 0, // если редактируется
    item: '',
    presum: 0,
    sum: 0,
    customer: {
        id: 0, // если редактируется
        phone_number: '',
        fio: '',
    },
    status: '', // если редактируется
    note: ''
}


export default function ({isOpen, close, row, stock_id}) {

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar()

    const [saleId, setSaleId] = useState(0)
    const [id, setId] = useState(0)
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
        setItem('')
        setPresum(0)
        setSum(0)
        setCustomer(initCustomer)
        setStatus(statuses[0])
        setNote('')
    }

    useEffect(() => {

        if (row) {

            setDisabled(true)

            setSaleId(row.id)
            setItem(row.item)
            setPresum(row.sum)
            setNote(row.note)

            try {

                const wf = JSON.parse(row.wf)

                if (wf.zakaz) {
                    rest('zakaz/' + wf.zakaz)
                        .then(res => {
                            if (res.status === 200 && res.body) {

                                setDisabled(!statuses.includes(res.body.status))

                                setId(+wf.zakaz || res.body.id)
                                setItem(res.body.item)
                                setPresum(res.body.presum)
                                setSum(res.body.sum)
                                setStatus(res.body.status)
                                needleCustomerFields.map(f => updateCustomer(f, res.body.customer[f]))
                                setNote(res.body.note)

                            }
                        })
                } else {
                    enqueueSnackbar('не удалось загрузить предоплату', {variant: 'error'})
                }

            } catch (e) {
                enqueueSnackbar('не удалось определить предоплату', {variant: 'error'})
            }

        } else {
            reset()
        }

    }, [row, isOpen])

    // useEffect(() => {
    //
    //     console.log('customer', customer)
    //
    // }, [customer])

    const save = () => {

        let error;

        if (!item) error = 'Укажите наименование'
        else if (customer === initCustomer) error = 'Не указан заказчик'
        else if (sum < 1) error = 'Окончательная стоимость должна быть больше 0'

        if (error) return enqueueSnackbar(error, {variant: 'error'})

        let url = 'zakaz/' + stock_id
        const data = {item, presum, sum, customer, status, note}

        if (id) url += '/' + id
        if (saleId) data.sale_id = saleId

        setDisabled(true)

        rest(url, id ? 'PATCH' : 'POST', data)
            .then(res => {

                    // console.log(res)

                setDisabled(false)

                if (res.status === 200) {
                        exit()
                    } else {
                        enqueueSnackbar((res.status || '') + ' ' + (res.body
                            ? res.body[0].toString()
                            : 'error'),
                            {variant: 'error'}
                        )
                    }

                }
            )

    }

    const del = () => {

    }

    const exit = () => {

        reset()
        close()

    }

    const updateCustomer = (name, val) => {

        if (needleCustomerFields.includes(name)) {

            setCustomer(prev => {

                const newState = {...prev}
                newState[name] = val
                return newState

            })

        }

    }

    return <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => exit()}
    >
        <DialogTitle>

            Предоплата

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <DialogContent>

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
                needleCustomerFields={needleCustomerFields}
                updateCustomer={updateCustomer}
            />

            {row
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
                <Button onClick={() => row
                    ? del()
                    : exit()}
                        color="secondary">
                    {row
                        ? 'Вернуть'
                        : 'Отмена'}
                </Button>
                <Button onClick={() => save()}
                        color="primary">
                    {row
                        ? 'Сохранить'
                        : 'Внести'}
                </Button>
            </DialogActions>
        }


    </Dialog>
}