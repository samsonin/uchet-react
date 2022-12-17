import React, {useEffect, useState} from "react";

import rest from "./Rest";
import TableHead from "@material-ui/core/TableHead";
import {Button, FormControlLabel, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import uuid from "uuid";
import {toLocalTimeStr} from "./common/Time";
import TextField from "@material-ui/core/TextField";
import {connect} from "react-redux";
import UsersSelect from "./common/UsersSelect";
import {makeStyles} from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";


const full = i => i > 9 ? i : '0' + i
const today = (new Date()).getFullYear() + '-' + full(1 + (new Date()).getMonth()) + '-' + full((new Date()).getDate())

const toUnix = date => {

    const d = new Date(date)
    d.setHours(0, 0, 0, 0);
    return d.getTime() / 1000

}

const useStyles = makeStyles(() => ({
    field: {
        margin: '.3rem .3rem',
    }
}))

const Zp = props => {

    const classes = useStyles()

    const [zp, setZp] = useState([])
    const [from, setFrom] = useState(() => today)
    const [to, setTo] = useState(() => today)
    const [userId, setUserId] = useState(() => props.auth.user_id)
    const [isAll, setIsAll] = useState(false);
    const [isRequest, setIsRequest] = useState(false);

    const getZp = () => {

        let url = 'zp/' + toUnix(from)

        url += '/' + (86399 + toUnix(to))

        if (props.auth.admin && props.auth.admin !== userId) {
            url += '/' + userId
        }

        setIsRequest(true)

        rest(url)
            .then(res => {

                setIsRequest(false)

                if (res.status === 200) {
                    setZp(res.body)
                }
            })

    }

    useEffect(() => getZp(), [])

    let total = 0

    return (
        <>

            {props.auth.admin && props.app.users && props.app.users.length &&
                <div style={{
                    width: '100%',
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                    <UsersSelect
                        classes={classes.field}
                        onlyValid={!isAll}
                        // disabled={false}
                        users={props.app.users}
                        user={userId}
                        setUser={setUserId}
                    />
                    <FormControlLabel
                        control={<Checkbox
                            checked={isAll}
                            onChange={() => setIsAll(!isAll)}
                            inputProps={{'aria-label': 'primary checkbox'}}
                        />}
                        label="Включая уволенных"
                    />
                </div>}

            <div style={{
                width: '100%',
                display: "flex",
                justifyContent: "space-between",
            }}>

                <TextField
                    style={{margin: '.5rem'}}
                    type="date"
                    label="c"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                />

                <TextField
                    style={{margin: '.5rem'}}
                    type="date"
                    label="по"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                />

            </div>

            <Button
                size="small"
                style={{margin: '.5rem'}}
                variant="outlined"
                disabled={isRequest}
                onClick={() => getZp()}
            >
                Рассчитать
            </Button>


            {zp
                ? <Table size="small"
                         style={{background: 'white'}}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>дата, время</TableCell>
                            <TableCell>за что</TableCell>
                            <TableCell>сумма</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {zp.map(z => {

                            total += z.sum

                            return <TableRow style={{
                                cursor: "pointer"
                            }}
                                             key={uuid()}>
                                <TableCell>{toLocalTimeStr(z.unix, true)}</TableCell>
                                <TableCell>{z.note}</TableCell>
                                <TableCell>{z.sum}</TableCell>
                            </TableRow>
                        })}
                        <TableRow>
                            <TableCell colSpan={2}>всего:</TableCell>
                            <TableCell style={{fontWeight: 'bold'}}>{total}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                : 'загружаем...'}
        </>)
}

export default connect(state => state)(Zp)