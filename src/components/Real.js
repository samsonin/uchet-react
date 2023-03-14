import React, {useEffect, useState} from "react";

import rest from "../components/Rest";
import { Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TwoLineInCell from "./common/TwoLineInCell";
import uuid from "uuid";
import {toLocalTimeStr} from "./common/Time";

const Real = () => {

    const [goods, setGoods] = useState([])

    useEffect(() => {

        rest('real')
            .then(res => {

                if (res.status === 200) {

                    setGoods(res.body)

                }

            })

    }, [])


    return goods.length
        ? <Table size="small"
                 style={{background: 'white'}}
        >
            <TableHead>
                <TableRow>
                    <TableCell>Время</TableCell>
                    <TableCell>Коммисионер</TableCell>
                    <TableCell>Товар</TableCell>
                    <TableCell>Цена</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {goods.map(g => {

                        const color = 'black'

                        return <TableRow key={uuid()}
                                         style={{
                                             cursor: 'pointer',
                                         }}
                                         onClick={() => console.log('onClick')}
                        >
                            <TableCell style={{color}}>
                                {toLocalTimeStr(g.good.unix)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(g.customer.fio, g.customer.phone_number)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(g.good.model, g.good.imei)}
                            </TableCell>
                            <TableCell style={{color}}>
                                {TwoLineInCell(g.sum, g.cost)}
                            </TableCell>
                        </TableRow>
                    })}

            </TableBody>
        </Table>
        : 'Нет данных'


}


export default Real