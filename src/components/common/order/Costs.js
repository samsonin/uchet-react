import React, {forwardRef, useState} from "react";
import {Checkbox, FormControlLabel, Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";

import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Slide from "@material-ui/core/Slide";
import {makeStyles} from "@material-ui/core/styles";
import CancelIcon from '@material-ui/icons/Cancel';
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import UsersSelect from "../UsersSelect";
import {intInputHandler} from "../InputHandlers";
import {toLocalTimeStr} from "../Time";
import TwoLineInCell from "../TwoLineInCell";
import {GoodSearch} from "../GoodSearch";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
})

const totalSum = costs => {

    let total = 0
    costs.map(c => total += c.good
        ? c.good.remcost || c.good.cost
        : +c.sum)
    return total

}

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
}))


export const Costs = ({order, isEditable, users, providers, updApp}) => {

    const [serviceOpen, setServiceOpen] = useState(false)
    const [job, setJob] = useState('')
    const [sum, setSum] = useState(0)
    const [user_id, setUserId] = useState(0)
    const [cash, setCash] = useState(false) // учесть в кассе

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const goods = order.provider && Array.isArray(order.provider)
        ? order.provider.filter(p => p.good)
        : null

    const services = order.provider && Array.isArray(order.provider)
        ? order.provider.filter(p => p.action === 'add_service')
        : null

    const canAddJob = job && sum > 0 && (user_id || cash)

    const addGood = (good, afterRes) => {

        const barcode = good.barcode

        if (!barcode) return enqueueSnackbar('нет кода', {variant: "error"})

        rest('orders/' + order.stock_id + '/' + order.id + '/' + barcode, 'POST')
            .then(res => afterRes(res.status === 200, res.status))

    }

    const addJob = () => {

        if (!canAddJob) return

        const data = {job, sum}

        if (cash) data.cash = true
        else data.user_id = user_id

        rest('order/costs/' + order.stock_id + '/' + order.id, 'POST', data)
            .then(res => {

                if (res.status === 200) {

                    setJob('')
                    setSum(0)
                    setUserId(0)
                    setServiceOpen(false)
                    enqueueSnackbar('Добавлено', {variant: 'success'})

                    updApp(res.body)

                } else {

                    enqueueSnackbar('Ошибка', {variant: 'error'})

                }

            })

    }

    const delGood = barcode => {

        if (!barcode) return enqueueSnackbar('нет кода', {variant: "error"})

        rest('orders/' + order.stock_id + '/' + order.id + '/' + barcode, 'DELETE')
            .then(res => res.status === 200
                ? updApp(res.body)
                : enqueueSnackbar('ошибка ' + res.status, {variant: "error"}))
    }

    const delJob = i => {

        rest('order/jobs/' + order.stock_id + '/' + order.id + '/' + i, 'DELETE')
            .then(res => res.status === 200
                ? updApp(res.body)
                : enqueueSnackbar('ошибка ' + res.status, {variant: "error"}))
    }

    const delSale = id => {

        rest('sales/' + order.stock_id + '/' + id, 'DELETE')
            .then(res => res.status === 200
                ? updApp(res.body)
                : enqueueSnackbar('ошибка ' + res.status, {variant: "error"}))
    }

    return <>

        <Dialog
            open={serviceOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setServiceOpen(false)}
        >
            <DialogTitle>

                Добавление работы в заказ

                <IconButton aria-label="close-add-job" className={classes.closeButton}
                            onClick={() => setServiceOpen(false)}>
                    <CloseIcon/>
                </IconButton>

            </DialogTitle>

            <DialogContent>

                <TextField label="Выполненная работа"
                           className={classes.field}
                           value={job}
                           onChange={e => setJob(e.target.value)}
                />

                <TextField label="Сумма"
                           className={classes.field}
                           value={sum}
                           onChange={e => intInputHandler(e.target.value, setSum)}
                />

                {cash || <UsersSelect
                    classes={classes.field}
                    users={users}
                    user={user_id}
                    setUser={setUserId}
                    onlyValid={true}
                />}

                {!user_id && <FormControlLabel
                    style={{

                    }}
                    control={<Checkbox checked={cash}
                                       onChange={() => setCash(!cash)}
                    />}
                    label="списать с кассы"
                />}

            </DialogContent>

            <DialogActions>
                <Button onClick={() => setServiceOpen(false)}
                        color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => addJob()}
                        disabled={!canAddJob}
                        color="primary">
                    Добавить
                </Button>
            </DialogActions>

        </Dialog>

        {goods && goods.length
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Поставщик, время</TableCell>
                        <TableCell colSpan="2">Себестоимость</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goods.map(g => {

                            const provider = providers.find(pr => pr.id === g.good.provider_id)

                            return <TableRow key={'tablerowkeyforgoodsinordes' + g.sum + g.barcode}>
                                <TableCell>{g.good.id}</TableCell>
                                <TableCell>{g.good.model}</TableCell>
                                <TableCell>
                                    {provider
                                        ? TwoLineInCell(provider.name, toLocalTimeStr(g.good.time))
                                        : g.good.time}
                                </TableCell>
                                <TableCell>{g.good.remcost || g.good.cost}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => delGood(g.barcode)}
                                    >
                                        <CancelIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        }
                    )}
                    <TableRow>
                        <TableCell colSpan={3} style={{
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            всего: {totalSum(goods)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : null}

        {isEditable && <GoodSearch onSelected={addGood}/>}

        {services && services.length
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Работа</TableCell>
                        <TableCell>Мастер</TableCell>
                        <TableCell colSpan={2}>Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {services.map((s, i) => {

                            const user = users.find(u => u.id === s.employee)

                            return <TableRow key={'tablerowkeyforservicesinordes' + JSON.stringify(s)}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>
                                    {user ? user.name : ''}
                                </TableCell>
                                <TableCell>{s.sum}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => s.hasOwnProperty('sale_id')
                                            ? delSale(s.sale_id)
                                            : delJob(i)}
                                    >
                                        <CancelIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        }
                    )}
                    <TableRow>
                        <TableCell colSpan={3} style={{
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            всего: {totalSum(services)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : null}

        {isEditable && <div style={{
            margin: '1rem',
        }}>
            <Button variant='outlined'
                    onClick={() => setServiceOpen(true)}
                    color="primary">
                Добавить другого мастера
            </Button>
        </div>}

    </>

}