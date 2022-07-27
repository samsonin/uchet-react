import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import rest from "../components/Rest";
import TableContainer from "@material-ui/core/TableContainer";
import {Checkbox, FormControlLabel, Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/TableBody";
import {v4 as uuidv4} from "uuid";
import LineWeightIcon from "@material-ui/icons/LineWeight";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import {PrintBarcodes} from "./common/PrintBarcodes";



const ArrivalToday = props => {

    const [goods, setGoods] = useState([])
    const [isGroup, setIsGroup] = useState(false)

    useEffect(() => {

        rest('goods/today')
            .then(res => {

                if (res.status === 200) {

                    setGoods(res.body)

                }

            })

    }, [])

    useEffect(() => {

        setGoods(goods.map(g => {
            if (+g.barcode === +props.newScan.substring(0, 12)) {

                console.log(g.barcode)

                g.isInStock = true
            }
            return g
        }))

    }, [props.newScan])

    const makeGroup = goods => {

        const group = []

        if (goods.length) {

            let nextGood

            goods.map(g => {

                if (nextGood && nextGood.category_id === g.category_id && nextGood.model === g.model) {

                    nextGood.barcodes.push(g.barcode)
                    nextGood.count++

                } else {

                    if (nextGood) group.push(nextGood)

                    nextGood = {
                        barcodes: [g.barcode],
                        category_id: g.category_id,
                        model: g.model,
                        stock_id: g.stock_id,
                        ui_wf: g.ui_wf,
                        count: 1
                    }

                }

            })

            group.push(nextGood)

        }

        return group

    }

    const goodsView = isGroup
        ? makeGroup(goods)
        : goods

    return <>

        <FormControlLabel
            control={<Checkbox
                checked={isGroup}
                onChange={() => setIsGroup(!isGroup)}
                inputProps={{'aria-label': 'primary checkbox'}}
            />}
            label="Сгруппировать"
        />

        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>

                    <TableRow>
                        {!isGroup && <TableCell>
                            #
                        </TableCell>}
                        <TableCell>
                            Категория
                        </TableCell>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Откуда
                        </TableCell>
                        {isGroup && <TableCell>Кол-во</TableCell>}
                        <TableCell/>
                    </TableRow>

                </TableHead>

                <TableBody>

                    {goodsView
                        .filter(g => !props.stock_id || props.stock_id === g.stock_id)
                        .map(good => {

                            let stock = props.stocks.find(st => st.id === good.stock_id)
                            let user = props.users.find(u => u.id === good.responsible_id)
                            let category = props.categories.find(c => c.id === good.category_id)

                            good.stock = stock
                                ? stock.name
                                : ''

                            good.user = user
                                ? user.name
                                : ''

                            good.category = category
                                ? category.name
                                : 'нет'

                            return <TableRow
                                key={uuidv4()}
                                style={{
                                    cursor: 'pointer',
                                    background: !isGroup && good.isInStock ? 'green' : 'white'
                                }}
                            >
                                {isGroup || <TableCell>
                                    {good.id}
                                </TableCell>}
                                <TableCell>
                                    {good.category}
                                </TableCell>
                                <TableCell>
                                    {good.model}
                                </TableCell>
                                <TableCell>
                                    {good.ui_wf}
                                </TableCell>
                                <TableCell>
                                    {good.count}
                                </TableCell>
                                <TableCell>
                                    {props.stock_id
                                        ? <Tooltip title="штрихкод">
                                            <IconButton onClick={
                                                () => PrintBarcodes(isGroup ? good.barcodes : [good.barcode])
                                            }>
                                                <LineWeightIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        : stock ? stock.name : ''}
                                </TableCell>

                            </TableRow>
                        })}

                </TableBody>
            </Table>
        </TableContainer>


    </>

}

export default connect(state => state.app)(ArrivalToday);