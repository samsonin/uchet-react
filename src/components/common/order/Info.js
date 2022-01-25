import React from "react";
import StatusesSelect from "../StatusesSelect";
import Button from "@material-ui/core/Button";
import {Table, TableBody, TableCell, TableRow, TextField} from "@material-ui/core";
import TwoLineInCell from "../TwoLineInCell";


export const Info = ({order, isEditable, app, fields}) => {


    const warranty = () => {

    }

    const getUser = user_id => {

        const user = app.users.find(u => u.id === user_id)

        return user ? user.name : 'Не определен'

    }

    return <>

        <StatusesSelect
            disabled={!isEditable}
            status={order.status_id}
            statuses={app.statuses}
        />

        <Table>
            <TableBody>
                {
                    [
                        ['Заказчик', TwoLineInCell(order.customer.fio, order.customer.phone_number)],
                        ['Устройство', TwoLineInCell(order.category_id || order.group_id, order.model)],
                        ['Сумма', order.sum2],
                        ['Мастер', getUser(order.master_id)],
                        fields.map(f => {
                            const next = [f.value, order[f.name]]
                            return next[1] ? next : null
                        })
                    ]
                        .map((r, n) => <TableRow key={'nablerowkeyinorderinfo' + n}>
                        <TableCell>
                            {r[0]}
                        </TableCell>
                        <TableCell>
                            {r[1]}
                        </TableCell>
                    </TableRow>)}
            </TableBody>
        </Table>


        {order && order.status_id === 6 &&
            <Button variant='outlined'
                    onClick={() => warranty()}
                    color="primary">
                Принять по гарантии
            </Button>}

    </>
}