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
import CloseIcon from "@material-ui/icons/Close";
import {makeStyles} from "@material-ui/core/styles";

import CustomersSelect from "../common/CustomersSelect"
import TextField from "@material-ui/core/TextField/TextField";

const statuses = [
    'Новая',
    'Заказали',
    'В магазине',
    'Ждем Клиента',
]

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',
        width: '90%'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));

const Prepaid = ({isOpen, close, row, disabled = false}) => {

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar()

    const [item, setItem] = useState('')
    const [presum, setPresum] = useState(0)
    const [sum, setSum] = useState(0)
    const [customerId, setCustomerId] = useState(0)
    const [status, setStatus] = useState('')
    const [note, setNote] = useState('')


    const reset = () => {
        setItem('')
        setPresum(0)
        setSum(0)
        setCustomerId(0)
        setStatus('')
        setNote('')
    }

    useEffect(() => {

        console.log('row', row)

        if (row) {
            setItem(row.item)
            setPresum(row.presum)
            setSum(row.sum)
            setCustomerId(row.customer_id)
            setStatus(row.status)
            setNote(row.note)
        } else {
            reset()
        }

    }, [row, isOpen])

    const save = () => {

        rest('zakaz/', 'POST', {

        })
            .then(res => {

            })

    }

    const del = () => {

    }

    const exit = () => {

        reset()
        close()

    }

    return <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => exit()}
    >
        <DialogTitle>

            {row ? '#' + row.id : ''}

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

            <div className={classes.field}>
                <CustomersSelect
                    customerId={0}
                    setCustomerId={() => {
                    }}
                />
            </div>

            {row
                ? <FormControl className={classes.field}>
                    <InputLabel id="prepaid-status-control-select-label">Статус</InputLabel>
                    <Select
                        labelId="prepaid-status-control-select-label"
                        disabled={disabled}
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        label="Статус"
                    >
                        <MenuItem key={'menustatusinprepaidkey0'}
                                  value={0}>
                            <br/>
                        </MenuItem>
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

export default Prepaid