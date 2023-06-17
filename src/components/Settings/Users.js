import React from "react";
import {connect} from "react-redux";
import TableHead from "@material-ui/core/TableHead";
import {LinearProgress, Switch, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import {toLocalTimeStr} from "../common/Time";
import {groupAlias} from "../common/GroupAliases";
import TwoLineInCell from "../common/TwoLineInCell";
import uuid from "uuid";


const Users = props => {

    return <Table size="small"
                  style={{background: 'white'}}
    >
        <TableHead>
            <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Статус</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {props.app.users
                .map(u => {

                    const position = props.app.positions.find(p => p.id === u.position_id)

                    return <TableRow key={uuid()}
                    >
                        <TableCell>
                            {u.id}
                        </TableCell>
                        <TableCell>
                            {TwoLineInCell(u.name || u.user, u.phone_number)}
                        </TableCell>
                        <TableCell>
                            {position ? position.name : ''}
                        </TableCell>
                        <TableCell>
                            <Switch checked={u.is_valid}
                                    color="primary"/>
                        </TableCell>
                    </TableRow>
                })}

        </TableBody>
    </Table>

}

export default connect(state => state)(Users);
