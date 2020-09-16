import React from 'react'
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
import {enqueueSnackbar, upd_app} from "../actions/actionCreator";
import {bindActionCreators} from "redux";
import Grid from "@material-ui/core/Grid";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

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

class Queue extends React.Component {

    state = {
        allowed: false
    }

    allowedChange = () => {
        this.setState({allowed: !this.state.allowed})
    }

    pointChange = (user_id, stock_id, permission) => {

        rest('queue', 'PATCH',
            {user_id, stock_id, permission})
            .then(res => {

                if (res.ok) {
                    const {upd_app} = this.props;
                    upd_app(res.body);
                }

                this.props.enqueueSnackbar({
                    message: res.ok ? 'ok' : res.error,
                    options: {
                        variant: res.ok ? 'success' : 'warning',
                    },
                });

            })

    };

    renderTable(o, permission) {

        let arr = [];
        for (const user_id in o) {
            arr.push(
                <TableRow key={'rowkey' + user_id + o[user_id]}>
                    <TableCell>
                        {this.props.app.users.find(v => +v.id === +user_id).name}
                    </TableCell>
                    <TableCell>
                        <MyFormControl variant="outlined">
                            <Select onChange={e => this.pointChange(+user_id, +e.target.value, permission)}
                                    value={o[user_id]}
                            >
                                <MenuItem key={'mik0'} value={0}>
                                    <br/>
                                </MenuItem>

                                {this.props.app.stocks.map(value => value.is_valid ?
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
                    <TableCell>
                        { this.state.allowed ? <FormGroup>
                            {this.props.app.stocks.map(v => {
                            return v.is_valid ? <FormControlLabel
                                control={<Checkbox
                                    color="primary"
                                    checked={true}
                                    // onChange={handleChange}
                                />}
                                label={v.name}
                            /> : ''
                            })}
                        </FormGroup> : '' }
                    </TableCell>
                </TableRow>
            )

        }
        return arr;

    }

    render() {
        return this.props.app.queue ?
            <Grid container spacing={3} alignContent="center">

                <Grid item>
                    <Typography variant="h5">Расстановка мастеров</Typography>
                    <MyPaper>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Мастер</TableCell>
                                    <TableCell>Куда вышел на смену</TableCell>
                                    { this.props.auth.admin ?
                                        <TableCell>
                                            <Checkbox
                                                color="primary"
                                                checked={this.state.allowed}
                                                onChange={this.allowedChange}
                                            />
                                            Разрешенные точки
                                        </TableCell>
                                        : ''
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.renderTable(this.props.app.queue, 'masters')}
                            </TableBody>
                        </Table>
                    </MyPaper>
                </Grid>

                {this.props.auth.admin && this.props.app.salersQueue ?
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
                                    {this.renderTable(this.props.app.salersQueue, 'sellers')}
                                </TableBody>
                            </Table>
                        </MyPaper>
                    </Grid>
                    : ''
                }

            </Grid> :
            'Загружаем данные...'
    }

}

const mapDispatchToProps = dispatch => bindActionCreators({
    enqueueSnackbar,
    upd_app
}, dispatch);

export default connect(state => (state), mapDispatchToProps)(Queue);