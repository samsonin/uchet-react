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
import {bindActionCreators} from "redux";
import {upd_app} from "../actions/actionCreator";

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

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Queue = (props) => {

    const {enqueueSnackbar} = useSnackbar();

    const [request, setRequest] = useState(false)

    const pointChange = (user_id, stock_id) => {

        setRequest(true)

        rest('queue', 'PATCH', {user_id, stock_id})
            .then(res => {

                if (res.ok) {
                    const {upd_app} = props
                    upd_app({queue: res.body.queue})
                }

                setRequest(false)

                enqueueSnackbar(res.ok ? 'ok' : res.error,
                    {variant: res.ok ? 'success' : 'warning'}
                );

            })

    };

    const renderTable = queue => <TableBody>

        {queue.map(q => {

            const user = props.app.users.find(u => +u.id === q.user_id)

            return user
                ? <TableRow key={'rowinqueuetablekey' + q.user_id}>
                    <TableCell>
                        {user.name}
                    </TableCell>
                    <TableCell>
                        <MyFormControl variant="outlined">
                            <Select onChange={e => pointChange(q.user_id, +e.target.value)}
                                    value={q.stock_id}
                                    disabled={request}
                            >
                                <MenuItem key={'queueselectstockskey' + q.user_id + '0'}
                                          value={0}
                                >
                                    <br/>
                                </MenuItem>

                                {q.allowed_stocks.map(as => {

                                    const stock = props.app.stocks.find(s => s.id === as)
                                    return stock
                                        ? <MenuItem
                                            key={'queueselectstockskeytest' + q.user_id + as}
                                            value={as}
                                        >
                                            {stock.name}
                                        </MenuItem>
                                        : null
                                })}

                            </Select>
                        </MyFormControl>
                    </TableCell>
                </TableRow>
                : null

        })}

    </TableBody>

    return props.app.queue

        ? <Grid container spacing={3} alignContent="center">

            <Grid item>
                <Typography variant="h5" align={'center'}>
                    Смены мастеров
                </Typography>
                <MyPaper>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Мастер</TableCell>
                                <TableCell>Куда вышел на смену</TableCell>
                            </TableRow>
                        </TableHead>
                        {renderTable(props.app.queue)}
                    </Table>
                </MyPaper>
            </Grid>

        </Grid>
        : 'Загружаем данные...'

}

export default connect(state => (state), mapDispatchToProps)(Queue);