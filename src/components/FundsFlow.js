import React, {useEffect, useState} from "react";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {makeStyles} from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";

import CachedIcon from '@material-ui/icons/Cached';
import Button from "@material-ui/core/Button";

import rest from "./Rest";


const useStyles = makeStyles((theme) => ({
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
const today = '2021-05-02'

export default connect(state => state)(props => {

    const classes = useStyles();

    const [stock, setStock] = useState(() => props.app.stock_id)
    const [dateFrom, setDateFrom] = useState(() => today)
    const [dateTo, setDateTo] = useState(() => today)

    const [requesting, setRequesting] = useState(false)

    const [count, setCount] = useState(0)

    const setInRange = date => {

        return date > today
            ? today
            : date < minDate
                ? minDate
                : date

    }

    useEffect(() => {

        console.log(count, dateFrom, dateTo)

        if (count > 10) return
        setCount(count => count + 1)

        if (dateTo !== setInRange(dateTo)) {
            return setDateTo(date => setInRange(date))
        }

        if (dateFrom !== setInRange(dateFrom)) {
            return setDateFrom(date => setInRange(date))
        }

        if (dateFrom > dateTo) {
            return setDateTo(dateFrom)
        }

    }, [stock, dateFrom, dateTo])

    const getReport = () => {

        setRequesting(true)

        rest('daily/' + stock + '/' + dateFrom + '/' + dateTo)
            .then(res => {

                setRequesting(false)

                console.log(res)
            })

    }

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

                    <FormControl variant="outlined" className={classes.controls}>
                        <InputLabel id="funds-stocks-control-select-outlined-label">Точка</InputLabel>
                        <Select
                            labelId="funds-stocks-control-select-outlined-label"
                            disabled={requesting}
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            label="точка"
                        >
                            <MenuItem key={'menustockscontrolinfundskey0'}
                                      value={0}>Все</MenuItem>
                            {props.app.stocks.map(st => {
                                return <MenuItem key={'menustockscontrolinfundskey' + st.id}
                                                 value={st.id}>
                                    {st.name}
                                </MenuItem>
                            })}
                        </Select>
                    </FormControl>

                </Grid>

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
                        disabled={requesting}
                        className={classes.controls}
                        startIcon={<CachedIcon />}
                        onClick={() => getReport()}
                    >
                        Сформировать
                    </Button>

                </Grid>

            </Grid>
        </>
        : <h1>Доступ запрещен!</h1>

})
