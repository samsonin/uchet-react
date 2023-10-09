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

import StocksCheck from "./common/StocksCheck";

const useStyles = makeStyles(() => ({
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

export default connect(state => state)(props => {

    const classes = useStyles();

    const [stocks, setStocks] = useState(() => props.app.stocks
        .map(s => s.is_valid ? s.id : null)
        .filter(s => s))
    const [dateFrom, setDateFrom] = useState(() => today)
    const [dateTo, setDateTo] = useState(() => today)

    const [requesting, setRequesting] = useState(false)
    const [actual, setActual] = useState(false)

    const [data, setData] = useState(null)

    let proceeds = 0
    let cashless = 0
    let handed = 0

    const setInRange = date => date > today
        ? today
        : date < minDate
            ? minDate
            : date

    useEffect(() => {

        if (dateTo !== setInRange(dateTo)) {
            return setDateTo(date => setInRange(date))
        }

        if (dateFrom !== setInRange(dateFrom)) {
            return setDateFrom(date => setInRange(date))
        }

        if (dateFrom > dateTo) {
            return setDateTo(dateFrom)
        }

        setActual(false)

    }, [stocks, dateFrom, dateTo])


    const getReport = () => {

        setRequesting(true)

        let url = 'funds/' + dateFrom + '/' + dateTo + '?'

        if (stocks) stocks.map(s => {
            if (s) url += 'stock_ids[]=' + s + '&'
        })


        rest(url)
            .then(res => {

                setRequesting(false)

                if (res.ok) {

                    setActual(true)

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
        ? data.map(d => {

            proceeds += d.proceeds
            cashless += d.cashless
            handed += d.handed

            return <TableRow
                key={'table-row-key-in-funds' + d.id}
            >
                {['date', 'morning', 'proceeds', 'cashless', 'handed', `evening`]
                    .map(v => <TableCell>{d[v]}</TableCell>)}
            </TableRow>
        })
        : <TableRow>
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

            <StocksCheck
                stocks={stocks}
                setStocks={setStocks}
                disabled={requesting}
            />

            <Grid container
                  justify={'center'}
                  alignItems={'center'}
            >

                <Grid item>

                    <TextField
                        className={classes.controls}
                        variant="outlined"
                        disabled={requesting}
                        label="дата с"
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                </Grid>

                <Grid item>

                    <TextField
                        className={classes.controls}
                        variant="outlined"
                        disabled={requesting}
                        label="дата по"
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />

                </Grid>

                <Grid item>

                    <Button
                        variant="contained"
                        disabled={requesting || actual || !stocks.length}
                        className={classes.controls}
                        startIcon={<CachedIcon/>}
                        onClick={() => getReport()}
                    >
                        Сформировать
                    </Button>

                </Grid>

            </Grid>

            <TableContainer component={Paper}>
                <Table size="small">

                    <TableHead>
                        <TableRow>
                            <TableCell>дата</TableCell>
                            <TableCell>на утро</TableCell>
                            <TableCell>выручка</TableCell>
                            <TableCell>безнал</TableCell>
                            <TableCell>сдали</TableCell>
                            <TableCell>на вечер</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>

                        {renderBody()}

                    </TableBody>

                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Всего:</TableCell>
                            <TableCell>{proceeds}</TableCell>
                            <TableCell>{cashless}</TableCell>
                            <TableCell>{handed}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>

                </Table>
            </TableContainer>

        </>
        : <h1>Доступ запрещен!</h1>

})
