import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import GoodModal from "./Modals/Good";
import rest from "../components/Rest";
import TableHead from "@material-ui/core/TableHead";
import {Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import TwoLineInCell from "./common/TwoLineInCell";

const Showcase = props => {

    const [open, setOpen] = useState(false)
    const [good, setGood] = useState({})
    const [showcase, setShowcase] = useState([])


    useEffect(() => {

        rest('goods/showcase')
            .then(res => {
                if (res.status === 200) {
                    setShowcase(res.body)
                }
            })

    }, [])

    return <>
        <GoodModal
            good={good}
            close={() => setGood({})}
        />

        {showcase.length
            ? <Table size="small"
                     style={{
                         background: 'white'
                     }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Группа</TableCell>
                        <TableCell>Наименование / imei</TableCell>
                        <TableCell>Цена</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {showcase
                        .filter(s => props.app.stock_id
                            ? props.app.stock_id === s.stock_id
                            : true)
                        .map(s => <TableRow key={'tablerowinshowcase' + s.id}
                                            style={{
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setGood(s)}
                        >
                            <TableCell>{s.id}</TableCell>
                            <TableCell>{s.group}</TableCell>
                            <TableCell>
                                {TwoLineInCell(s.model, s.imei)}
                            </TableCell>
                            <TableCell>
                                {s.sum}
                            </TableCell>
                        </TableRow>)}
                </TableBody>
            </Table>
            : 'Нет данных'}
    </>

}

export default connect(state => state)(Showcase)