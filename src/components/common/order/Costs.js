import React, {useState} from "react";
import {Table, TableCell, TableRow} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import {toLocalTimeStr} from "../Time";

import TwoLineInCell from "../TwoLineInCell";

const totalSum = costs => {

    let total = 0

    costs.map(c => {

        total += c.good
            ? c.good.remcost || c.good.cost
            : +c.sum

    })

    return total

}


export const Costs = ({order, isEditable, users, providers}) => {

    const goods = order.provider
        ? order.provider.filter(p => p.good)
        : null

    const services = order.provider
        ? order.provider.filter(p => p.action === 'add_service')
        : null

    return <>
        {goods
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Наименование</TableCell>
                        <TableCell>Поставщик, время</TableCell>
                        <TableCell>Себестоимость</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {goods.map(g => <TableRow key={'tablerowkeyforgoodsinordes' + g.sum + g.barcode}>
                            <TableCell>{g.good.id}</TableCell>
                            <TableCell>{g.good.model}</TableCell>
                            <TableCell>
                                {TwoLineInCell(providers.find(pr => pr.id === g.good.provider_id).name, toLocalTimeStr(g.good.time))}
                            </TableCell>
                            <TableCell>{g.good.remcost || g.good.cost}</TableCell>
                        </TableRow>
                    )}
                    <TableRow>
                        <TableCell colSpan={3} style={{
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            всего: {totalSum(goods)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : null}

        {services
            ? <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Работа</TableCell>
                        <TableCell>Мастер</TableCell>
                        <TableCell>Сумма</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {services.map(s => <TableRow key={'tablerowkeyforservicesinordes' + JSON.stringify(s)}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>
                                {users.find(u => u.id === s.user_id).name}
                            </TableCell>
                            <TableCell>{s.sum}</TableCell>
                        </TableRow>
                    )}
                    <TableRow>
                        <TableCell colSpan={3} style={{
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            всего: {totalSum(services)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            : null}
    </>

}