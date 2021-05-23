import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import rest from "../components/Rest"
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import StocksSelect from "./common/StocksSelect";
import {makeStyles} from "@material-ui/core/styles";
import {Paper, Typography} from "@material-ui/core";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";

const useStyles = makeStyles((theme) => ({
    controls: {
        margin: 15,
        minWidth: 120,
    },
    employees: {
        margin: 15,
        marginLeft: 30
    },
    table: {
        margin: '1rem'
    }
}))

const minDate = '2020-01-01'
const today = (new Date()).toISOString().slice(0, 10)

const prepaidArray = ['предоплата']
const salesArray = ['продажа', 'возврат', 'из залога', 'выкупили', 'продали']
const serviceArray = ['0']
const costsArray = ['поступление', 'покупка', 'в залог', 'вернули', 'расход', 'зарплата', 'другое']

const Daily = props => {

    const [stock, setStock] = useState(() => props.app.stock_id || props.app.stocks.find(s => s.is_valid).id)
    const [date, setDate] = useState(() => today)
    const [localDaily, setLocalDaily] = useState([])

    const classes = useStyles()

    const setInRange = date => date > today
        ? today
        : date < minDate
            ? minDate
            : date

    useEffect(() => {

        if (!stock || !date || date === today) return

        if (date !== setInRange(date)) {
            return setDate(date => setInRange(date))
        }

        rest('daily/' + stock + '/' + date)
            .then(res => {

                if (res.status === 200) {
                    setLocalDaily(res.body)
                }

            })

    }, [stock, date])

    const daily = date === today
        ? props.app.daily.find(d => d.stock_id === stock)
        : localDaily

    let employeesText = daily.employees
        ? daily.employees.map(e => {

            let user = props.app.users.find(u => u.id === e)

            return user
                ? user.name
                : ''

        }).join()
        : ''

    let prepaids = daily.sales
        ? daily.sales.filter(s => prepaidArray.includes(s.action))
        : []

    let prepaidsSum = 0

    prepaids.map(s => {
        prepaidsSum += s.sum
    })

    let sales = daily.sales
        ? daily.sales.filter(s => salesArray.includes(s.action))
        : []

    let salesSum = 0

    sales.map(s => {
        salesSum += s.sum
    })

    let services = daily.sales
        ? daily.sales.filter(s => serviceArray.includes(s.action))
        : []

    let serviceSum = 0

    services.map(s => {
        serviceSum += s.sum
    })

    let costs = daily.sales
        ? daily.sales.filter(s => costsArray.includes(s.action))
        : []

    let costSum = 0

    costs.map(s => {
        costSum += s.sum
    })

    return <>
        <Grid container
              justify={'center'}
              alignItems={'center'}
        >
            <Grid item xs={6}>

                <StocksSelect
                    stocks={props.app.stocks}
                    stock={stock}
                    setStock={setStock}
                    disabled={false}
                    classes={classes.controls}
                />
            </Grid>

            <Grid item xs={6}>
                <TextField
                    className={classes.controls}
                    variant="outlined"
                    disabled={false}
                    label="дата"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </Grid>
        </Grid>

        <Typography variant="h6" className={classes.employees}>
            {employeesText}
        </Typography>

        <TableContainer component={Paper} className={classes.table}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Typography variant="h6">
                                Предоплаты
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip title="Внести предоплату">
                                <IconButton className={classes.add}
                                            onClick={() => console.log('addPrepaid')}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Сумма
                        </TableCell>
                        <TableCell>
                            Примечание
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {prepaids.map(s => <TableRow
                        key={'prepaidstablerowindaily' + s.id}
                    >
                        <TableCell>
                            {s.item}
                        </TableCell>
                        <TableCell>
                            {s.sum}
                        </TableCell>
                        <TableCell>
                            {s.note}
                        </TableCell>
                    </TableRow>)}
                </TableBody>

                <TableHead>
                    <TableRow>
                        <TableCell>
                            Итого:
                        </TableCell>
                        <TableCell colSpan={2}>
                            {prepaidsSum}
                        </TableCell>
                    </TableRow>
                </TableHead>

            </Table>
        </TableContainer>

        <TableContainer component={Paper} className={classes.table}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Typography variant="h6">
                                Товары
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip title="Продать товар">
                                <IconButton className={classes.add}
                                            onClick={() => console.log('saleGood')}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Действие
                        </TableCell>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Сумма
                        </TableCell>
                        <TableCell>
                            Примечание
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sales.map(s => <TableRow
                        key={'psalestablerowindaily' + s.id}
                    >
                        <TableCell>
                            {s.item}
                        </TableCell>
                        <TableCell>
                            {s.sum}
                        </TableCell>
                        <TableCell>
                            {s.note}
                        </TableCell>
                    </TableRow>)}
                </TableBody>

                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>
                            Итого:
                        </TableCell>
                        <TableCell colSpan={2}>
                            {salesSum}
                        </TableCell>
                    </TableRow>
                </TableHead>

            </Table>
        </TableContainer>

        <TableContainer component={Paper} className={classes.table}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <Typography variant="h6">
                                Работы, услуги
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip title="Продать услугу">
                                <IconButton className={classes.add}
                                            onClick={() => console.log('addPrepaid')}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            #
                        </TableCell>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Что сделали
                        </TableCell>
                        <TableCell>
                            Сумма
                        </TableCell>
                        <TableCell>
                            Сотрудник
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {prepaids.map(s => <TableRow
                        key={'prepaidstablerowindaily' + s.id}
                    >
                        <TableCell>
                            {s.id}
                        </TableCell>
                        <TableCell>
                            {s.sum}
                        </TableCell>
                        <TableCell>
                            {s.note}
                        </TableCell>
                        <TableCell>
                            {s.sum}
                        </TableCell>
                        <TableCell>
                            {s.note}
                        </TableCell>
                    </TableRow>)}
                </TableBody>

                <TableHead>
                    <TableRow>
                        <TableCell>
                            Итого:
                        </TableCell>
                        <TableCell colSpan={2}>
                            {prepaidsSum}
                        </TableCell>
                    </TableRow>
                </TableHead>

            </Table>
        </TableContainer>

        <TableContainer component={Paper} className={classes.table}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Typography variant="h6">
                                Товары
                            </Typography>
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip title="Продать товар">
                                <IconButton className={classes.add}
                                            onClick={() => console.log('saleGood')}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Действие
                        </TableCell>
                        <TableCell>
                            Наименование
                        </TableCell>
                        <TableCell>
                            Сумма
                        </TableCell>
                        <TableCell>
                            Примечание
                        </TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {sales.map(s => <TableRow
                        key={'psalestablerowindaily' + s.id}
                    >
                        <TableCell>
                            {s.item}
                        </TableCell>
                        <TableCell>
                            {s.sum}
                        </TableCell>
                        <TableCell>
                            {s.note}
                        </TableCell>
                    </TableRow>)}
                </TableBody>

                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>
                            Итого:
                        </TableCell>
                        <TableCell colSpan={2}>
                            {salesSum}
                        </TableCell>
                    </TableRow>
                </TableHead>

            </Table>
        </TableContainer>

    </>
}

export default connect(state => state)(Daily);
