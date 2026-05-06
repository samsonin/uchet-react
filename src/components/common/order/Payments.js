import React, {useState} from "react";

import {toLocalTimeStr} from "../Time";
import {Table, TableCell, TableRow} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import TwoLineInCell from "../TwoLineInCell";
import {numberInputHandler} from "../InputHandlers";


const PAYMENTMETHODS = [
    'наличные',
    'безнал',
    'онлайн Яндекс',
    'онлайн Сбербанк',
    'расчетный счет'
]

const totalSum = payments => {

    let total = 0

    payments.map(p => {
        if (+p.sum !== 0) total += +p.sum
    })

    return total

}

const paymentUserId = payment => payment.user_id ?? payment.ui_user_id ?? payment.employee ?? 0

const paymentUserName = (payment, users) => {

    const userId = paymentUserId(payment)
    const user = users.find(u => +u.id === +userId)

    return user ? user.name : ''

}

export const Payments = ({order, isEditable, users = []}) => {

    const [sum, setSum] = useState(0)

    const {enqueueSnackbar} = useSnackbar()

    const addHandler = () => {

        if (!sum) return

        rest('order/payments/' + order.stock_id + '/' + order.id, 'POST', {sum})
            .then(res => {
                if (res.status === 200) {
                    setSum(0)
                    enqueueSnackbar('Внесено ' + sum, {variant: 'success'})
                } else {
                    enqueueSnackbar('Ошибка', {variant: 'error'})
                }
            })

    }

    return <>

        {order.json && order.json.payments
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Дата, время</TableCell>
                        <TableCell>Сотрудник</TableCell>
                        <TableCell>Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {order.json.payments && order.json.payments.map(p => <TableRow
                        key={'tablerowkeyforpaymentsinordes' + p.sum + p.created_at}>
                        <TableCell>{toLocalTimeStr(p.created_at)}</TableCell>
                        <TableCell>{paymentUserName(p, users)}</TableCell>
                        <TableCell>
                            {TwoLineInCell(+p.sum, PAYMENTMETHODS[p.paymentsMethod])}
                        </TableCell>
                    </TableRow>)}
                    <TableRow>
                        <TableCell colSpan={3} style={{
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            всего: {order.json.payments
                            ? totalSum(order.json.payments)
                            : 0}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : null}

        {isEditable && <div style={{
            margin: '1rem',
        }}>
            <TextField label="Сумма"
                       className={'w-50'}
                       value={sum}
                       onChange={e => numberInputHandler(e.target.value, setSum)}
            />
            <Button variant='outlined'
                    disabled={!sum}
                    onClick={() => addHandler()}
                    color="primary">
                Добавить
            </Button>
        </div>}
    </>

}
