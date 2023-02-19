import React from "react";

import {Table, TableBody, TableHead, TableRow, TableCell, IconButton, Typography} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";

import TwoLineInCell from "./TwoLineInCell";
import {toLocalTimeStr} from "./Time";


const GoodsTable = ({goods, delGood, providers}) => {

    const totalSum = () => {

        let total = 0
        goods.map(g => total += +(g.remcost || g.cost))
        return total

    }

    return goods && goods.length
        ? <>
            <Typography variant="subtitle">
                Запчасти и материалы:
            </Typography>

            <Table size="small" >
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Наименование</TableCell>
                    <TableCell>Поставщик, время</TableCell>
                    <TableCell colSpan="2">Себестоимость</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {goods.map(g => {

                        const provider = providers.find(pr => pr.id === g.provider_id)

                        return <TableRow key={'table-row-key-for-goods-in-table' + g.sum + g.barcode}>
                            <TableCell>{g.id}</TableCell>
                            <TableCell>{g.model}</TableCell>
                            <TableCell>
                                {provider
                                    ? TwoLineInCell(provider.name, toLocalTimeStr(g.unix))
                                    : g.unix}
                            </TableCell>
                            <TableCell>{g.remcost || g.cost}</TableCell>
                            <TableCell>
                                <IconButton
                                    onClick={() => delGood(g.barcode)}
                                >
                                    <CancelIcon/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    }
                )}
                <TableRow>
                    <TableCell colSpan={3} style={{
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        всего: {totalSum()}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
            </>
        : null

}

export default GoodsTable