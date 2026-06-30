import React, {useState} from 'react'
import {connect} from "react-redux";
import rest from "./Rest";

import {styled} from 'muiLegacyStyles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {useSnackbar} from "notistack";

const MyPaper = styled(Paper)({
    marginTop: 20,
    marginLeft: 20,
    width: '100%',
    overflowX: 'auto',
    overflowY: 'auto',
});

const MyFormControl = styled(FormControl)({
    width: 220,
    maxWidth: '100%',
});


const Queue = (props) => {

    const appStocks = props.app.stocks || []
    const appUsers = props.app.users || []
    const appQueue = props.app.queue || []
    const appStockUsers = props.app.stockusers || []
    const appDaily = props.app.daily || []

    const {enqueueSnackbar} = useSnackbar();

    const [request, setRequest] = useState(false)

    const pointChange = (user_id, stock_id) => {

        setRequest(true)

        rest('queue', 'PATCH', {user_id, stock_id})
            .then(res => {

                setRequest(false)

                enqueueSnackbar(res.ok ? 'ok' : res.error,
                    {variant: res.ok ? 'success' : 'warning'}
                );

            })

    };

    const getDailyStockId = userId => {
        const daily = appDaily.find(d => Array.isArray(d.employees)
            && d.employees.some(employeeId => +employeeId === +userId))

        return daily ? +daily.stock_id : 0
    }

    const getSelectedStockId = q => +(q.stock_id || getDailyStockId(q.user_id) || 0)

    const getAllowedStocks = q => {
        const stockIds = appStockUsers
            .filter(su => +su.user_id === +q.user_id)
            .map(su => +su.stock_id)

        const fallbackStockIds = (q.allowed_stocks || []).map(id => +id)
        const selectedStockId = getSelectedStockId(q)

        return [...new Set([...stockIds, ...fallbackStockIds, selectedStockId].filter(Boolean))]
            .map(id => appStocks.find(s => +s.id === +id && s.is_valid))
            .filter(Boolean)
    }

    const renderTable = queue => <TableBody>

        {queue.map(q => {

            const user = appUsers.find(u => +u.id === q.user_id)
            const allowedStocks = getAllowedStocks(q)
            const selectedStockId = getSelectedStockId(q)

            return user
                ? <TableRow key={'rowinqueuetablekey' + q.user_id}>
                    <TableCell>
                        {user.name}
                    </TableCell>
                    <TableCell>
                        <MyFormControl variant="outlined">
                            <Select
                                onChange={e => pointChange(q.user_id, +e.target.value)}
                                value={selectedStockId}
                                disabled={request || !props.auth.admin}
                                displayEmpty
                            >
                                <MenuItem
                                    key={'queueselectstockskey' + q.user_id + '0'}
                                    value={0}
                                >
                                    Не выбрана
                                </MenuItem>

                                {allowedStocks.map(stock => <MenuItem
                                    key={'queueselectstockskeytest' + q.user_id + stock.id}
                                    value={stock.id}
                                >
                                    {stock.name}
                                </MenuItem>)}

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
                        {renderTable(appQueue)}
                    </Table>
                </MyPaper>
            </Grid>

        </Grid>
        : 'Загружаем данные...'

}

export default connect(state => state)(Queue);
