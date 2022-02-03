import React, {useState} from "react";

import {Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";
import {useSnackbar} from "notistack";

import rest from "../../Rest"
import {toLocalTimeStr} from "../Time";

export const Remarks = ({order, isEditable, users}) => {

    const [remark, setRemark] = useState('')

    const {enqueueSnackbar} = useSnackbar()

    const handler = () => {

        if (!remark) return

        rest('order/remarks/' + order.stock_id + '/' + order.id, 'POST', {remark})
            .then(res => {
                if (res.status === 200) {
                    setRemark('')
                    enqueueSnackbar('Внесено', {variant: 'success'})
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
                    <TableCell>Сотрудник</TableCell>
                    <TableCell>Событие</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {order.remark && order.remark.map(r => {

                    const user = users.find(u => u.id === r.user_id)

                    return r.remark
                        ? <TableRow key={'tablerowkeyforremarksinordes' + (r.unix || r.time) + r.remark}>
                            <TableCell>
                                {toLocalTimeStr(r.unix || r.time)}
                            </TableCell>
                            <TableCell>{user ? user.name : ''}</TableCell>
                            <TableCell>{r.remark}</TableCell>
                        </TableRow>
                        : null
                })}
            </TableBody>
        </Table>

        {isEditable && <div style={{
            margin: '1rem',
        }}>
            <TextField className={'w-50'}
                       value={remark}
                       onChange={e => setRemark(e.target.value)}
            />

            <Button variant='outlined'
                    disabled={!remark}
                    onClick={() => handler()}
                    color="primary">
                Добавить
            </Button>
        </div>}

    </>
}