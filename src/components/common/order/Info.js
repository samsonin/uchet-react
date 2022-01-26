import React, {useState} from "react";
import StatusesSelect from "../StatusesSelect";
import Button from "@material-ui/core/Button";
import {Table, TableBody, TableCell, TableRow, TextField} from "@material-ui/core";
import {useSnackbar} from "notistack";

import TwoLineInCell from "../TwoLineInCell";
import rest from "../../Rest"

export const Info = ({order, isEditable, app, fields, isAdmin}) => {

    const [isRest, setIsRest] = useState(false)
    const {enqueueSnackbar} = useSnackbar()

    const setStatus = id => {

        if (id === order.status_id) return

        const data = {status_id: id}

        setIsRest(true)

        rest('order/' + order.stock_id + '/' + order.id, 'PATCH', data)
            .then(res => {
                setIsRest(false)
                if (res.status !== 200) enqueueSnackbar('ошибка', {variant: 'error'})
            })

    }

    const warranty = () => {

    }

    const getUser = user_id => {

        const user = app.users.find(u => u.id === user_id)

        return user ? user.name : 'Не определен'

    }

    const getModel = () => order.category_id
        ? TwoLineInCell(app.categories.find(c => c.id === order.category_id).name, order.model)
        : order.model

    const disabled = !isEditable || isRest

    return <>

        <StatusesSelect
            disabled={disabled}
            status={order.status_id}
            setStatus={setStatus}
            statuses={app.statuses}
        />

        <Table>
            <TableBody>
                {
                    [
                        ['Заказчик', order.customer
                            ? TwoLineInCell(order.customer.fio, order.customer.phone_number)
                            : 'Не указан'],
                        ['Устройство', getModel()],
                        ['Сумма', order.sum2],
                        ['Мастер', getUser(order.master_id)],
                        order.imei && ['imei', order.imei],
                        order.password && ['Пароль', order.password],
                    ].concat(fields.map(f => order[f.name]
                        ? [f.value, order[f.name]]
                        : null
                    ))
                        .map((r, n) => r
                            ? <TableRow key={'nablerowkeyinorderinfo' + n}>
                                <TableCell>
                                    {r[0]}
                                </TableCell>
                                <TableCell>
                                    {r[1]}
                                </TableCell>
                            </TableRow>
                            : null)}
            </TableBody>
        </Table>

        {order.status_id === 6 && isAdmin &&
            <Button variant='outlined'
                    onClick={() => setStatus(0)}
                    color="primary">
                Открыть заказ
            </Button>}

        {order.status_id === 6 &&
            <Button variant='outlined'
                    onClick={() => warranty()}
                    color="primary">
                Принять по гарантии
            </Button>}

    </>
}