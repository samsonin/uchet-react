import React, {forwardRef, useState} from "react";
import {Table, TableCell, TableRow} from "@material-ui/core";
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
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import UsersSelect from "../UsersSelect";
import {numberInputHandler} from "../NumberInputHandler";
import {toLocalTimeStr} from "../Time";
import TwoLineInCell from "../TwoLineInCell";


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


export const Costs = ({order, isEditable, users, providers}) => {

    const [open, setOpen] = useState(false)

    const [job, setJob] = useState('')
    const [sum, setSum] = useState(0)
    const [user_id, setUserId] = useState(0)

    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar()

    const goods = order.provider
        ? order.provider.filter(p => p.good)
        : null

    const services = order.provider
        ? order.provider.filter(p => p.action === 'add_service')
        : null

    const canAddJob = job && sum > 0 && user_id

    const addJob = () => {

        if (!canAddJob) return

        rest('order/payments/' + order.stock_id + '/' + order.id, 'POST',
            {
                job,
                sum,
                user_id
            })
            .then(res => {

                if (res.status === 200) {

                    setJob('')
                    setSum(0)
                    setUserId(0)
                    setOpen(false)
                    enqueueSnackbar('Добавлено', {variant: 'success'})

                } else {

                    enqueueSnackbar('Ошибка', {variant: 'error'})

                }

            })

    }

    return <>

        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setOpen(false)}
        >
            <DialogTitle>

                Добавление работы в заказ

                <IconButton aria-label="close-add-job" className={classes.closeButton}
                            onClick={() => setOpen(false)}>
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
                           onChange={e => numberInputHandler(e.target.value, setSum)}
                />

                <UsersSelect
                    classes={classes.field}
                    users={users}
                    user={user_id}
                    setUser={setUserId}
                    onlyValid={true}
                />

            </DialogContent>

            <DialogActions>
                <Button onClick={() => setOpen(false)}
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

        {goods
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Поставщик, время</TableCell>
                        <TableCell>Себестоимость</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goods.map(g => <TableRow key={'tablerowkeyforgoodsinordes' + g.sum + g.barcode}>
                            <TableCell>{g.good.id}</TableCell>
                            <TableCell>{g.good.model}</TableCell>
                            <TableCell>
                                {TwoLineInCell(providers.find(pr => pr.id === g.good.provider_id).name, toLocalTimeStr(g.good.time))}
                            </TableCell>
                            <TableCell>{g.good.remcost || g.good.cost}</TableCell>
                        </TableRow>
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

        {services
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Работа</TableCell>
                        <TableCell>Мастер</TableCell>
                        <TableCell>Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {services.map(s => {

                            const user = users.find(u => u.id === s.user_id)

                            return <TableRow key={'tablerowkeyforservicesinordes' + JSON.stringify(s)}>
                                <TableCell>{s.name}</TableCell>
                                <TableCell>
                                    {user ? user.name : ''}
                                </TableCell>
                                <TableCell>{s.sum}</TableCell>
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
                    onClick={() => setOpen(true)}
                    color="primary">
                Добавить работу
            </Button>
        </div>}

    </>

}