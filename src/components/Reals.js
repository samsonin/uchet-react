import React, {useEffect, useState} from "react";

import rest from "../components/Rest";
import {Table, TableBody, TableCell, TableRow, Typography} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TwoLineInCell from "./common/TwoLineInCell";
import uuid from "uuid";
import {toLocalTimeStr} from "./common/Time";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import Real from "./Real";
import {useSnackbar} from "notistack";

const Reals = () => {

    const [currentReal, setCurrentReal] = useState()
    const [reals, setReals] = useState([])

    const {enqueueSnackbar} = useSnackbar()

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

                }

            })

    }, [])


    return currentReal
        ? <Real
            current={currentReal}
            setCurrent={setCurrentReal}
            del={del}
        />
        : <Table size="small"
                 style={{background: 'white'}}
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
                                            onClick={() => console.log('Принять на реализацию')}
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

                        const color = 'black'

                        return <TableRow key={uuid()}
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