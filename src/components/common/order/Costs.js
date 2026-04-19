import React, {forwardRef, useState} from "react";
import {Checkbox, FormControlLabel, Table, TableCell, TableRow} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import {makeStyles} from "muiLegacyStyles";
import CancelIcon from '@mui/icons-material/Cancel';
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import UsersSelect from "../UsersSelect";
import {intInputHandler} from "../InputHandlers";
import {GoodSearch} from "../GoodSearch";
import GoodsTable from "../CostsTable";


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
    title: {
        position: 'relative',
        padding: '1rem 3.5rem 0.85rem 1.2rem !important',
        minHeight: '56px',
    },
    field: {
        margin: '1rem .3rem',
        width: '100%'
    },
    content: {
        padding: '0.75rem 1.2rem !important',
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
}))


export const Costs = ({order, isEditable, users, providers}) => {

    const [serviceOpen, setServiceOpen] = useState(false)
    const [job, setJob] = useState('')
    const [sum, setSum] = useState(0)
    const [user_id, setUserId] = useState(0)
    const [cash, setCash] = useState(false) // учесть в кассе

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const goods = order.provider && Array.isArray(order.provider)
        ? order.provider.filter(p => p.good).map(p =>p.good)
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

                } else {

                    enqueueSnackbar('Ошибка', {variant: 'error'})

                }

            })

    }

    const afterRes = res => {
        if (res.status !== 200) {
            enqueueSnackbar('ошибка ' + res.status, {variant: "error"})
        }
    }

    const delGood = barcode => {

        if (!barcode) return enqueueSnackbar('нет кода', {variant: "error"})

        rest('orders/' + order.stock_id + '/' + order.id + '/' + barcode, 'DELETE')
            .then(res => afterRes(res))

    }

    const delJob = i => rest('order/jobs/' + order.stock_id + '/' + order.id + '/' + i, 'DELETE')
        .then(res => afterRes(res))

    const delSale = id => rest('sales/' + order.stock_id + '/' + id, 'DELETE')
        .then(res => afterRes(res))

    return <>

        <Dialog
            open={serviceOpen}
            slots={{ transition: Transition }}
            keepMounted
            onClose={() => setServiceOpen(false)}
        >
            <DialogTitle className={classes.title}>

                Добавление работы в заказ

                <IconButton aria-label="close-add-job" className={classes.closeButton}
                            onClick={() => setServiceOpen(false)}>
                    <CloseIcon/>
                </IconButton>

            </DialogTitle>

            <DialogContent className={classes.content}>

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
                    control={<Checkbox checked={cash}
                                       onChange={() => setCash(!cash)}
                    />}
                    label="списать с кассы"
                />}

            </DialogContent>

            <DialogActions className={classes.actions}>
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

        <GoodsTable delGood={delGood} goods={goods} providers={providers} />

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
