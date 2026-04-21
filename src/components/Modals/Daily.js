import React, {forwardRef, useEffect, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from '@mui/icons-material/Close';
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import TextField from "@mui/material/TextField";
import UsersSelect from "../common/UsersSelect";
import {makeStyles} from 'muiLegacyStyles';
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {numberInputHandler} from "../common/InputHandlers";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    title: {
        position: 'relative',
        padding: '1rem 3.5rem 0.85rem 1.2rem !important',
        minHeight: '56px',
    },
    field: {
        margin: '0 !important',
        width: '100%'
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
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        zIndex: 1,
    }
}));

const actions = ['0', 'предоплата', 'продажа', 'расход', 'зарплата']

const full = d => d < 10 ? '0' + d : d
const toString = unix => {
    const date = new Date(unix * 1000)
    return date.getFullYear() + '-' + full(1 + date.getMonth()) + '-' + full(date.getDate())
}
const weeks = Math.trunc(Date.now() / 1209600000) - 1
const getDate1 = () => toString(weeks * 1209600 + 345600)
const getDate2 = () => toString(weeks * 1209600 + 1468800)

const itemToDate = item => {

    const year = (new Date()).getFullYear()

    const dateFrom = year + '-' + item.substring(3, 5) + '-' + item.substring(0, 2)
    const dateTo = year + '-' + item.substring(9, 11) + '-' + item.substring(6, 8)

    return [dateFrom, dateTo]

}

const toZp = (date1, date2) => date1.substring(8, 10) + '.' + date1.substring(5, 7) + '-' +
    date2.substring(8, 10) + '.' + date2.substring(5, 7)


const DailyModal = props => {

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar()

    const [isZp, setIsZp] = useState(false)
    const [date1, setDate1] = useState(() => getDate1())
    const [date2, setDate2] = useState(() => getDate2())
    const [item, setItem] = useState('')
    const [sum, setSum] = useState(0)
    const [employee, setEmployee] = useState(0)
    const [note, setNote] = useState('')

    const reset = () => {

        setItem('')
        setSum(0)
        setEmployee(0)
        setNote('')

    }

    useEffect(() => {

        if (props.row) {

            setItem(props.row.item)
            setSum(props.row.sum)
            setEmployee(props.row.employee)
            setNote(props.row.note)

            if (props.type === 'Расходы, зарплата') {

                setIsZp(props.row.action === 'зарплата')

                if (props.row.action === 'зарплата') {

                    const [dateFrom, dateTo] = itemToDate(props.row.item)

                    setDate1(dateFrom)
                    setDate2(dateTo)

                }

            }

        } else {
            reset()
        }

    }, [props.row, props.isOpen])

    const exit = () => {

        reset()
        props.close()

    }

    const del = () => {

        const url = props.type === 'Подотчеты'
            ? 'imprest'
            : 'sales'

        rest(url + '/' + props.current_stock_id + '/' + props.row.id, 'DELETE')
            .then(res => {

                if (res.status === 200) exit()
                props.afterRes(res)

            })

    }

    const save = () => {

        if (props.row && props.row.stock_id && props.current_stock_id !== props.row.stock_id) {
            return enqueueSnackbar('другая точка', {variant: 'error'})
        }

        if (isZp && !employee) return enqueueSnackbar('не указан получатель зарплаты',
                {variant: 'error'})

        if (!+sum) return enqueueSnackbar('сумма должна отличатся от нуля',
            {variant: 'error'})

        let url = (props.type === 'Подотчеты'
            ? 'imprest'
            : 'sales') + '/' + props.current_stock_id

        if (props.row) url += '/' + props.row.id

        const data = {
            item,
            sum: +sum,
            employee,
            note,
        }

        if (props.type !== 'Подотчеты') {

            const types = ['Работы, услуги', 'Предоплаты', 'Товары', 'Расходы, зарплата']

            let actionId = types.indexOf(props.type)

            if (actionId === 3 && isZp) {

                actionId = 4

                data.item = toZp(date1, date2)

            }

            data.action = actions[actionId]

        }

        rest(url, props.row ? 'PATCH' : 'POST', data)
            .then(res => {

                if (res.status === 200) exit()
                props.afterRes(res)

            })

    }

    return <Dialog
        open={props.isOpen}
        slots={{ transition: Transition }}
        onClose={() => props.close()}
    >
        <DialogTitle className={classes.title}>

            {props.type === 'Расходы, зарплата'
                ? <Select
                    labelId="actions-cost-control-select-outlined-label"
                    disabled={props.disabled}
                    value={isZp}
                    onChange={e => setIsZp(e.target.value)}
                    className={classes.field}
                >
                    {['расход', 'зарплата'].map((a, i) => <MenuItem
                        key={'menucostactionskey' + a}
                        value={!!i}>
                        {a}
                    </MenuItem>)}
                </Select>
                : props.type
            }

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>
        <DialogContent className={classes.content}>

            {props.type === 'Расходы, зарплата' && isZp
                ? <>
                    <TextField label="дата с"
                               type="date"
                               disabled={props.disabled}
                               className={classes.field}
                               value={date1}
                               onChange={e => setDate1(e.target.value)}
                    />
                    <TextField label="дата по"
                               type="date"
                               disabled={props.disabled}
                               className={classes.field}
                               value={date2}
                               onChange={e => setDate2(e.target.value)}
                    />
                </>
                : <TextField label="Наименование"
                             disabled={props.disabled}
                             className={classes.field}
                             value={item}
                             onChange={e => setItem(e.target.value)}
                />}

            <TextField label="Сумма"
                       disabled={props.disabled}
                       className={classes.field}
                       value={sum}
                       onChange={e => numberInputHandler(e.target.value, setSum)}
            />

            <UsersSelect
                    classes={classes.field}
                    disabled={props.disabled}
                    users={props.users}
                    user={employee}
                    setUser={setEmployee}
                    onlyValid={true}
                />

            <TextField label="Примечание"
                       disabled={props.disabled}
                       className={classes.field}
                       value={note}
                       onChange={e => setNote(e.target.value)}
            />

        </DialogContent>

        {props.disabled
            ? ''
            : <DialogActions className={classes.actions}>
                <Button onClick={() => props.row
                    ? del()
                    : props.close()}
                        color="secondary">
                    {props.row
                        ? 'Удалить'
                        : 'Отмена'}
                </Button>
                <Button onClick={() => save()}
                        color="primary">
                    {props.row
                        ? 'Сохранить'
                        : 'Внести'}
                </Button>
            </DialogActions>
        }

    </Dialog>

}

export default connect(state => state.app)(DailyModal);
