import React, {useState} from 'react'
import {connect} from "react-redux";
import rest from "./Rest";

import {styled} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {Select} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {useSnackbar} from "notistack";

const MyPaper = styled(Paper)({
    marginTop: 20,
    marginLeft: 20,
    width: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
});

const MyFormControl = styled(FormControl)({
    minWidth: 150,
});

const AvailableStock = (props) => {

    const {enqueueSnackbar} = useSnackbar();

    const pointChange = (user_id, stock_id, permission) => {

        console.log(user_id, stock_id, permission)

        rest('queue', 'PATCH',
            {user_id, stock_id, permission})
            .then(res => {

                if (res.ok) {
                    // const {upd_app} = props;
                    // upd_app(res.body);
                }

                enqueueSnackbar(res.ok ? 'ok' : res.error,
                    {variant: res.ok ? 'success' : 'warning'}
                    );

            })

    };

    const renderTable = (o, permission) => {

        let arr = [];
        for (const user_id in o) {
            arr.push(
                <TableRow key={'rowkey' + user_id + o[user_id]}>
                    <TableCell>
                        {props.app.users.find(v => +v.id === +user_id).name}
                    </TableCell>
                    <TableCell>
                        <MyFormControl variant="outlined">
                            <Select onChange={e => pointChange(+user_id, +e.target.value, permission)}
                                    value={o[user_id]}
                            >
                                <MenuItem key={'mik0'} value={0}>
                                    <br/>
                                </MenuItem>

                                {props.app.stocks.map(value => value.is_valid ?
                                    <MenuItem
                                        key={'mik' + value.id}
                                        value={value.id}
                                    >
                                        {value.name}
                                    </MenuItem> :
                                    '')}

                            </Select>
                        </MyFormControl>
                    </TableCell>
                </TableRow>
            )

        }
        return arr;

    }

    return props.app.queue

        ? <Grid container spacing={3} alignContent="center">

            <Grid item>
                <Typography variant="h5">Расстановка мастеров</Typography>
                <MyPaper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Мастер</TableCell>
                                <TableCell>Куда вышел на смену</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {renderTable(props.app.queue, 'masters')}
                        </TableBody>
                    </Table>
                </MyPaper>
            </Grid>

            {props.auth.admin && props.app.salersQueue ?
                <Grid item>
                    <Typography variant="h5">Расстановка администраторов</Typography>
                    <MyPaper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Администратор</TableCell>
                                    <TableCell>Куда вышел на смену</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderTable(props.app.salersQueue, 'sellers')}
                            </TableBody>
                        </Table>
                    </MyPaper>
                </Grid>
                : null
            }

        </Grid>
        : 'Загружаем данные...'

}

export default connect(state => state)(AvailableStock);