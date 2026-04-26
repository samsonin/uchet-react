import React, {useEffect, useState} from "react";

import {Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";
import TableHead from "@mui/material/TableHead";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {useSnackbar} from "notistack";
import { v4 as uuid } from "uuid";

import Real from "./Real";
import rest from "../components/Rest";
import TwoLineInCell from "./common/TwoLineInCell";
import {toLocalTimeStr} from "./common/Time";

const Reals = props => {

    const realId = +props.match.params.id

    const [currentReal, setCurrentReal] = useState(() => realId === 0 ? {} : '')
    const [reals, setReals] = useState([])

    const {enqueueSnackbar} = useSnackbar()

    const add = real => {

        setCurrentReal()

        const newReals = [...reals]
        newReals.push(real)

        setReals(newReals)

    }

    const del = id => {

        setCurrentReal()

        setReals(reals.filter(r => r.id !== id))

        enqueueSnackbar('ok', {variant: 'success'})

    }

    useEffect(() => {

        rest('real')
            .then(res => {

                if (res.status === 200) {

                    setReals(res.body)

                    if (realId) setCurrentReal(res.body.find(r => r.id === realId))

                }

            })

    }, [])


    return currentReal
        ? <Real
            current={currentReal}
            setCurrent={setCurrentReal}
            add={add}
            del={del}
        />
        : <Table size="small"
                 style={{
                     background: 'var(--surface)',
                     color: 'var(--text)',
                     border: '1px solid var(--line)',
                 }}
        >
            <TableHead>

                <TableRow>
                    <TableCell colSpan={3}>
                        <Typography variant="h6">
                            Товары на реализации
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Tooltip title={'Принять на реализацию'}>
                            <IconButton style={{
                                padding: 0,
                                marginLeft: '.1rem',
                                marginRight: '.1rem',
                            }}
                                        onClick={() => setCurrentReal({})}
                            >
                                <AddCircleIcon/>
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>Время</TableCell>
                    <TableCell>Комитент</TableCell>
                    <TableCell>Товар</TableCell>
                    <TableCell>Цена</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {reals.length
                    ? reals.map(r => {

                        const color = 'var(--text)'

                        return r.good && r.customer && <TableRow key={uuid()}
                                                                 style={{
                                                                     cursor: 'pointer',
                                                                 }}
                                                                 onClick={() => setCurrentReal(r)}
                        >
                            <TableCell style={{color}}>
                                {toLocalTimeStr(r.good.unix)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(r.customer.fio, r.customer.phone_number)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(r.good.model, r.good.imei)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(r.sum, r.cost)}
                            </TableCell>
                        </TableRow>
                    })
                    : <TableRow>
                        <TableCell colSpan={4} align="center">
                            Нет данных
                        </TableCell>
                    </TableRow>}
            </TableBody>
        </Table>


}


export default Reals
