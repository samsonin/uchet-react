import React, {useState} from "react";
import {connect} from "react-redux";
import TableHead from "@material-ui/core/TableHead";
import {
    FormControlLabel,
    InputAdornment,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from "@material-ui/core";
import TwoLineInCell from "../common/TwoLineInCell";
import uuid from "uuid";
import SearchIcon from "@material-ui/icons/Search";


const Users = props => {

    const [isAll, setIsAll] = useState(false)
    const [search, setSearch] = useState('')


    return <>

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            margin: '.5rem',
        }}>

            <TextField
                autoFocus
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
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

        </div>

        <Table size="small"
               style={{background: 'white'}}
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

                        const name = u.name.toLowerCase()
                        const email = u.email ? u.email.toLowerCase() : ''
                        const pn = u.phone_number.toLowerCase()

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
                                                color="primary"/>}
                                />
                            </TableCell>
                        </TableRow>
                    })}

            </TableBody>
        </Table>
    </>
}

export default connect(state => state)(Users);
