import React, {forwardRef, useEffect, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CloseIcon from '@material-ui/icons/Close';
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import TextField from "@material-ui/core/TextField/TextField";
import UsersSelect from "../common/UsersSelect";
import {makeStyles} from '@material-ui/core/styles';
import IconButton from "@material-ui/core/IconButton";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

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

    const dateFrom = year + '-' + item.substr( 3, 2) + '-' + item.substr( 0, 2)
    const dateTo = year + '-' + item.substr( 9, 2) + '-' + item.substr( 6, 2)

    return [dateFrom, dateTo]

}

const toZp = (date1, date2) => date1.substr(8, 2) + '.' + date1.substr(5, 2) + '-' +
    date2.substr(8, 2) + '.' + date2.substr(5, 2)


const DailyModal = props => {

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar()

    const [isZp, setIsZp] = useState(false)
    const [date1, setDate1] = useState(() => getDate1())
    const [date2, setDate2] = useState(() => getDate2())
    const [item, setItem] = useState('')
    const [sum, setSum] = useState('0')
    const [employee, setEmployee] = useState(0)
    const [note, setNote] = useState('')

    const reset = () => {

        setItem('')
        setSum('0')
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

        rest(url + '/' + props.stock_id + '/' + props.row.id, 'DELETE')
            .then(res => {

                if (res.status === 200) exit()
                props.afterRes(res)

            })

    }

    const save = () => {

        if (props.row && props.row.stock_id && props.stock_id !== props.row.stock_id) {
            return enqueueSnackbar('другая точка', {variant: 'error'})
        }

        if (isZp && !employee) {
            return enqueueSnackbar('не указан получатель зарплаты',
                {variant: 'error'})
        }

        if (!+sum) {
            return enqueueSnackbar('сумма должна отличатся от нуля',
                {variant: 'error'})
        }

        let url = (props.type === 'Подотчеты'
            ? 'imprest'
            : 'sales') + '/' + props.stock_id

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
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
    >
        <DialogTitle>

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
        <DialogContent>

            {props.type === 'Расходы, зарплата' && isZp
                ? <>
                    <TextField label="дата по"
                               type="date"
                               disabled={props.disabled}
                               className={classes.field}
                               value={date1}
                               onChange={e => setDate1(e.target.value)}
                    />
                    <TextField label="дата с"
                               type="date"
                               disabled={props.disabled}
                               className={classes.field}
                               value={date2}
                               onChange={e => setDate2(e.target.value)}
                    />                </>
                : <TextField label="Наименование"
                             disabled={props.disabled}
                             className={classes.field}
                             value={item}
                             onChange={e => setItem(e.target.value)}
                />}

            <TextField label="Сумма"
                       // type="number"
                       disabled={props.disabled}
                       className={classes.field}
                       value={sum}
                       onChange={e => setSum(e.target.value)}
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
            : <DialogActions>
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