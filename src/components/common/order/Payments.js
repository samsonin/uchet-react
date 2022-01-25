import React, {useState} from "react";

import {toLocalTimeStr} from "../Time";
import {Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
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

export const Payments = ({order, isEditable}) => {

    const [sum, setSum] = useState(0)

    const {enqueueSnackbar} = useSnackbar()

    if (!(order.json)) return <></>

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

        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Дата, время</TableCell>
                    <TableCell>Сумма</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {order.json.payments.map(p => <TableRow key={'tablerowkeyforpaymentsinordes' + p.sum + p.created_at}>
                    <TableCell>{toLocalTimeStr(p.created_at)}</TableCell>
                    <TableCell>
                        {TwoLineInCell(+p.sum, PAYMENTMETHODS[p.paymentsMethod])}
                    </TableCell>
                </TableRow>)}
                <TableRow>
                    <TableCell colSpan={2} style={{
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        всего: {totalSum(order.json.payments)}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>

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