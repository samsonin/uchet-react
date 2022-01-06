import React, {useState} from "react";
import {Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import {toLocalTimeStr} from "../Time";

import TwoLineInCell from "../TwoLineInCell";

export const Costs = ({order, isEditable}) => {

    return <>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Наименование</TableCell>
                    <TableCell>Поставщик, время</TableCell>
                    <TableCell>Себестоимость</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {order.provider.map(p => <TableRow key={'tablerowkeyforpaymentsinordes' + p.sum + p.barcode}>
                    {/*<TableCell>{toLocalTimeStr(p.created_at)}</TableCell>*/}
                    {/*<TableCell>{+p.sum}</TableCell>*/}
                    {/*<TableCell>{PAYMENTMETHODS[p.paymentsMethod]}</TableCell>*/}
                </TableRow>)}
                <TableRow>
                    <TableCell colSpan={3} style={{
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        {/*всего: {totalSum(order.provider)}*/}
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </>

}