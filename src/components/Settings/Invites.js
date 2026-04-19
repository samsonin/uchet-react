import React, { useState } from "react";
import { connect } from "react-redux";

import TableHead from "@mui/material/TableHead";
import {
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteCircleIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

import rest from "../../components/Rest";
import InviteModal from "../../components/Modals/Invite";

const Invites = props => {

    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [invite, setInvite] = useState(null);

    const { enqueueSnackbar } = useSnackbar()

    const addInvite = () => {

        if (props.app.invites.length > 9) {
            return enqueueSnackbar("Максимальное количество приглашений - 10", {
                variant: 'error'
            })
        }

        setInvite({});
        setIsInviteOpen(true);
    };

    const editInvite = (invite) => {
        setInvite(invite);
        setIsInviteOpen(true);
    };

    const deleteInvite = id => {
        return rest('invites/' + id, 'DELETE')
            .then(res => {
                if (res.status === 200) {
                    return res;
                }
            });
    };


    return <div style={{ padding: 20 }}>
        <h1>Приглашения</h1>

        {isInviteOpen && (
            <InviteModal
                isOpen={isInviteOpen}
                close={() => setIsInviteOpen(false)}
                invite={invite}
            />
        )}

        <Table size="small" style={{ background: 'var(--surface)' }}>
            <TableHead>
                <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Тип контакта</TableCell>
                    <TableCell>Контакт</TableCell>
                    <TableCell>Должность</TableCell>
                    <TableCell align="right">
                        <Tooltip title="Добавить приглашение">
                            <IconButton onClick={addInvite}>
                                <AddCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {props.app.invites?.length > 0 ? (
                    props.app.invites.map(i => (
                        <TableRow
                            key={i.id}
                            hover
                            style={{ cursor: 'pointer' }}
                            onClick={() => editInvite(i)}
                        >
                            <TableCell>{i.name}</TableCell>
                            <TableCell>{i.type}</TableCell>
                            <TableCell>{i.value}</TableCell>
                            <TableCell>
                                {i.position_name || props.app.positions.find(p => p.id === i.position_id)?.name || 'Не указана'}
                            </TableCell>
                            <TableCell align="right" onClick={e => e.stopPropagation()}>
                                <Tooltip title="Удалить приглашение">
                                    <IconButton onClick={() => deleteInvite(i.id)}>
                                        <DeleteCircleIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4}>Нет доступных приглашений.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>


    </div>
}


export default connect(state => state)(Invites);
