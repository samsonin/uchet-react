import React, {useEffect, useState} from "react";

import rest from "./Rest";
import TableHead from "@material-ui/core/TableHead";
import {Button, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import uuid from "uuid";
import {toLocalTimeStr} from "./common/Time";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";


const full = i => i > 9 ? i : '0' + i
const today = (new Date()).getFullYear() + '-' + full(1 + (new Date()).getMonth()) + '-' + full((new Date()).getDate())

const toUnix = date => {

    const d = new Date(date)
    d.setHours(0, 0, 0, 0);
    return d.getTime() / 1000

}

const Zp = () => {

    const [zp, setZp] = useState([])
    const [from, setFrom] = useState(() => today)
    const [to, setTo] = useState(() => today)


    const getZp = () => {

        const f = toUnix(from)

        let url = 'zp/' + f

        if (from !== to) url += '/' + to

        rest(url)
            .then(res => {
                if (res.status === 200) {
                    setZp(res.body)
                }
            })

    }

    let total = 0

    return (
        <>

            <Grid item className="w-100 m-2 p-2">
                c
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                />
                по
                <TextField
                    type="date"
                    className={"m-2 p-2"}
                    value={to}
                    onChange={e => setTo(e.target.value)}
                />

                <Button size="small" variant="outlined"
                        disabled={false}
                        onClick={() => getZp()}
                >
                    Рассчитать
                </Button>
            </Grid>


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

export default Zp