import React, { useState } from "react";
import { connect } from "react-redux";

import TableHead from "@mui/material/TableHead";
import {
    FormControlLabel,
    InputAdornment,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import TwoLineInCell from "../common/TwoLineInCell";
import { v4 as uuid } from "uuid";
import rest from "../Rest";

import { Link } from 'react-router-dom';
import { UiButton } from "../common/Ui";

const toLowerSafe = value => String(value || '').toLowerCase();

const Users = props => {

    const [isAll, setIsAll] = useState(false)
    const [search, setSearch] = useState('')

    const validChange = userId => {

        const user = props.app.users.find(u => u.id === userId)

        if (!user) return

        rest('users/' + userId, user.is_valid ? 'DELETE' : 'POST')

    }

    return <>

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            gap: '.75rem',
            margin: '.5rem',
        }}>

            <TextField
                autoFocus
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <FormControlLabel control={

                <Switch checked={isAll}
                    color="primary"
                    onChange={() => setIsAll(!isAll)}
                />
            }
                label="включая уволенных"
            />

            <Link to={"/settings/invites"}>
                <UiButton
                    className="btn-l"
                    block
                    color="mdb-color"
                >
                    Пригласить пользователя
                </UiButton>
            </Link>


        </div >

        <Table size="small"
            style={{ background: 'var(--surface)' }}
        >
            <TableHead>
                <TableRow>
                    <TableCell>Имя</TableCell>
                    <TableCell>Должность</TableCell>
                    <TableCell>Статус</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.app.users
                    .filter(u => u.is_valid || isAll)
                    .filter(u => {

                        if (!search) return true

                        const name = toLowerSafe(u.name)
                        const email = toLowerSafe(u.email)
                        const pn = toLowerSafe(u.phone_number)

                        let r = true

                        search.toLowerCase()
                            .split(' ')
                            .map(u => {

                                if (name.indexOf(u) < 0 && email.indexOf(u) < 0 && pn.indexOf(u) < 0) {
                                    r = false
                                }

                                return u

                            })

                        return r

                    })
                    .map(u => {

                        const position = props.app.positions.find(p => p.id === u.position_id)

                        return <TableRow key={uuid()}
                        >
                            <TableCell>
                                {TwoLineInCell(u.name, position ? position.name : '')}
                            </TableCell>
                            <TableCell>
                                {TwoLineInCell(u.phone_number, u.email)}
                            </TableCell>
                            <TableCell>
                                <FormControlLabel
                                    label={u.is_valid ? "Работает" : "Уволен"}
                                    control={
                                        <Switch checked={u.is_valid}
                                            color="primary"
                                            onChange={() => validChange(u.id)}
                                        />}
                                />
                            </TableCell>
                        </TableRow>
                    })}

            </TableBody>
        </Table>
    </>
}

export default connect(state => state)(Users);
