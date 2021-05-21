import React, {useEffect, useState} from "react";

import rest from "../components/Rest"
import TableContainer from "@material-ui/core/TableContainer";
import {Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TableBody from "@material-ui/core/TableBody";
import {connect} from "react-redux";


const Transit = props => {

    const [state, setState] = useState()

    useEffect(() => {

        rest('transit')
            .then(res => {

                if (res.status === 200) {

                    setState(res.body)

                }

            })

    }, [])

    return state
        ? <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Время
                        </TableCell>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Откуда
                        </TableCell>
                        <TableCell>
                            Ответственный
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {state.map(good => <TableRow>
                            <TableCell>
                                {good.outtime}
                            </TableCell>
                            <TableCell>
                                {good.model}
                            </TableCell>
                            <TableCell>
                                {props.stocks.find(st => st.id === good.stock_id).name}
                            </TableCell>
                            <TableCell>
                                {props.users.find(u => u.id === good.responsible_id).name}
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
        </TableContainer>

        : <h5>Загружаем данные...</h5>

}

export default connect(state => state.app)(Transit);
