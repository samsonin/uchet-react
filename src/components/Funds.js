import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";

import CachedIcon from '@material-ui/icons/Cached';
import Button from "@material-ui/core/Button";

import rest from "./Rest";
import TableContainer from "@material-ui/core/TableContainer";
import {Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";

import StocksSelect from "./common/StocksSelect";
import uuid from "uuid";

const useStyles = makeStyles(theme => ({
    typography: {
        margin: 5,
        textAlign: "center"
    },
    controls: {
        margin: 15,
        minWidth: 120,
    },
}));

const minDate = '2020-01-01'
const full = d => d < 10 ? '0' + d : d
const today = (new Date()).getFullYear() + '-' + full(1 + (new Date()).getMonth()) + '-' + full((new Date()).getDate())

const columnNames = ['дата', 'на утро', 'выручка', 'безнал', 'сдали', 'на вечер']
const columnValues = [null, 'Всего:', proceeds, cashless, handed, null]

export default connect(state => state)(props => {

    const classes = useStyles();

    const [stock, setStock] = useState(() => props.app.current_stock_id)
    const [dateFrom, setDateFrom] = useState(() => today)
    const [dateTo, setDateTo] = useState(() => today)

    const [isRequesting, setIsRequesting] = useState(false)
    const [data, setData] = useState(null)

    const setInRange = date => date > today ? today : date < minDate ? minDate : date

    const getReport = () => {

        setIsRequesting(true)

        rest('daily/funds')
            .then(res => {

                setIsRequesting(false)

                if (res.ok) {

                    let totalData = []

                    res.body.forEach(d => {

                        let lastDay = totalData.find(t => t.date === d.date)

                        if (lastDay) {

                            lastDay.morning += d.morning
                            lastDay.proceeds += d.proceeds
                            lastDay.cashless += d.cashless
                            lastDay.handed += d.handed
                            lastDay.evening += d.evening

                        } else {

                            totalData.push(d)

                        }

                    })

                    return setData(totalData)

                }

            })

    }

// eslint-disable-next-line
    useEffect(() => getReport(), [])

    const renderBody = () => data && data.length
        ? data.map(d => <TableRow key={uuid()}>
            {['date', 'morning', 'proceeds', 'cashless', 'handed', `evening`]
                .map(v => <TableCell key={uuid()}>{d[v]}</TableCell>)}
        </TableRow>)
        : <TableRow key={uuid()}>
            <TableCell colSpan={6}>
                Нет данных
            </TableCell>
        </TableRow>

    return props.auth.admin
        ? <>
            <Typography
                variant="h4"
                className={classes.typography}
            >
                Движение денежных средств
            </Typography>

            <Grid container
                  justify={'center'}
                  alignItems={'center'}
            >

                <Grid item>

                    <StocksSelect
                        stocks={props.app.stocks}
                        stock={stock}
                        setStock={setStock}
                        disabled={isRequesting}
                        classes={classes.controls}
                    />

                </Grid>

                <Grid item>

                    <TextField
                        className={classes.controls}
                        variant="outlined"
                        disabled={isRequesting}
                        label="дата с"
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                    />

                </Grid>

                <Grid item>

                    <TextField
                        className={classes.controls}
                        variant="outlined"
                        disabled={isRequesting}
                        label="дата по"
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                    />

                </Grid>

            </Grid>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columnNames.map(v => <TableCell key={uuid()}>{v}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {renderBody()}

                    </TableBody>

                    <TableHead>
                        <TableRow>
                            {columnValues.map(v => <TableCell key={uuid()}>{v}</TableCell>)}
                        </TableRow>
                    </TableHead>

                </Table>
            </TableContainer>

        </>
        : <h1>Доступ запрещен!</h1>

})
