import React, {useEffect, useMemo, useState} from "react";

import {toLocalTimeStr} from "../Time";
import {Box, FormControl, InputLabel, MenuItem, Select, Table, TableCell, TableRow} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import {numberInputHandler} from "../InputHandlers";


const PAYMENTMETHODS = [
    'наличные',
    'безнал',
    'онлайн Яндекс',
    'онлайн Сбербанк',
    'расчетный счет'
]

const CASH_PAYMENT_NAME = 'наличные'

const normalizeName = value => String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()

const getPaymentMethodOptions = paymentTypes => {

    const activeTypes = Array.isArray(paymentTypes)
        ? paymentTypes.filter(type => type && type.is_active !== false)
        : []

    if (activeTypes.length) {
        return activeTypes.map(type => ({
            value: type.id,
            name: type.name,
        }))
    }

    return PAYMENTMETHODS.map((name, index) => ({
        value: index,
        name,
    }))

}

const getPaymentTypesFromResponse = body => {
    if (Array.isArray(body)) return body
    if (Array.isArray(body?.payment_types)) return body.payment_types
    if (Array.isArray(body?.paymentTypes)) return body.paymentTypes
    if (Array.isArray(body?.data)) return body.data

    return []
}

const getDefaultPaymentMethod = paymentOptions => {

    const cash = paymentOptions.find(option => normalizeName(option.name) === CASH_PAYMENT_NAME)

    return cash ? cash.value : paymentOptions[0]?.value ?? 0

}

const paymentMethodName = (payment, paymentOptions) => {

    if (payment.payment_type?.name) return payment.payment_type.name
    if (payment.paymentType?.name) return payment.paymentType.name

    const paymentMethod = payment.payment_type_id
        ?? payment.paymentTypeId
        ?? payment.payment_type
        ?? payment.paymentsMethod

    const option = paymentOptions.find(option => String(option.value) === String(paymentMethod))

    return option?.name || PAYMENTMETHODS[payment.paymentsMethod] || CASH_PAYMENT_NAME

}

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

export const Payments = ({order, isEditable, users = [], paymentTypes = []}) => {

    const [loadedPaymentTypes, setLoadedPaymentTypes] = useState([])
    const availablePaymentTypes = Array.isArray(paymentTypes) && paymentTypes.length
        ? paymentTypes
        : loadedPaymentTypes
    const paymentOptions = useMemo(() => getPaymentMethodOptions(availablePaymentTypes), [availablePaymentTypes])

    const [sum, setSum] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState(() => getDefaultPaymentMethod(paymentOptions))

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {
        if (Array.isArray(paymentTypes) && paymentTypes.length) return

        rest('payment-types', 'GET', '', false, {showGlobalLoader: false})
            .then(res => {
                const types = getPaymentTypesFromResponse(res?.body)
                if (types.length) setLoadedPaymentTypes(types)
            })
    }, [paymentTypes])

    useEffect(() => {
        if (!paymentOptions.find(option => String(option.value) === String(paymentMethod))) {
            setPaymentMethod(getDefaultPaymentMethod(paymentOptions))
        }
    }, [paymentOptions, paymentMethod])

    const addHandler = () => {

        if (!sum) return

        rest('order/payments/' + order.stock_id + '/' + order.id, 'POST', {
            sum,
            paymentsMethod: paymentMethod,
            payment_type_id: paymentMethod,
        })
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
                        <TableCell>Способ</TableCell>
                        <TableCell>Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {order.json.payments && order.json.payments.map(p => <TableRow
                        key={'tablerowkeyforpaymentsinordes' + p.sum + p.created_at}>
                        <TableCell>{toLocalTimeStr(p.created_at)}</TableCell>
                        <TableCell>{paymentUserName(p, users)}</TableCell>
                        <TableCell>{paymentMethodName(p, paymentOptions)}</TableCell>
                        <TableCell>
                            {+p.sum}
                        </TableCell>
                    </TableRow>)}
                    <TableRow>
                        <TableCell colSpan={4} style={{
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

        {isEditable && <Box sx={{
            margin: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
        }}>
            <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="order-payment-method-label">Способ</InputLabel>
                <Select
                    labelId="order-payment-method-label"
                    label="Способ"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                >
                    {paymentOptions.map(option => <MenuItem
                        key={'order-payment-method-' + option.value}
                        value={option.value}
                    >
                        {option.name}
                    </MenuItem>)}
                </Select>
            </FormControl>
            <TextField label="Сумма"
                       size="small"
                       sx={{ width: 160 }}
                       value={sum}
                       onChange={e => numberInputHandler(e.target.value, setSum)}
            />
            <Button variant='outlined'
                    sx={{ minHeight: 40 }}
                    disabled={!sum}
                    onClick={() => addHandler()}
                    color="primary">
                Добавить
            </Button>
        </Box>}
    </>

}
