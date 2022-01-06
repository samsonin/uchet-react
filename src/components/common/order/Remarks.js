import React, {useState} from "react";

import {Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TextField from "@material-ui/core/TextField/TextField";
import Button from "@material-ui/core/Button";

import {toLocalTimeStr} from "../Time";

export const Remarks = ({order, isEditable, users}) => {

    const [add, setAdd] = useState('')

    const addHandler = () => {



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
                {order.remark.map(r => {

                    const user = users.find(u => u.id === r.user_id)

                    return r.remark
                        ? <TableRow key={'tablerowkeyforremarksinordes' + r.unix || r.time + r.remark}>
                            <TableCell>{toLocalTimeStr(r.unix || r.time)}</TableCell>
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
                       value={add}
                       onChange={e => setAdd(e.target.value)}
            />

            <Button variant='outlined'
                    onClick={() => addHandler()}
                    color="primary">
                Добавить
            </Button>
        </div>}

    </>
}