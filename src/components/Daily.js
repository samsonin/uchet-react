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
    },
    totals: {
        margin: '1rem',
        padding: '1rem'
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

    let employeesText = daily && daily.employees
        ? daily.employees.map(e => {

            let user = props.app.users.find(u => u.id === e)

            return user
                ? user.name
                : ''

        }).join(', ')
        : ''

    const makeForTable = array => {

        let answer = daily && daily.sales
            ? daily.sales.filter(s => array.includes(s.action))
            : []

        let sum = 0;

        answer.map(s => {
            sum += s.sum
        })

        return [answer, sum]

    }

    let [prepaids, prepaidsSum] = makeForTable(prepaidArray)
    let [sales, salesSum] = makeForTable(salesArray)
    let [services, serviceSum] = makeForTable(serviceArray)
    let [costs, costSum] = makeForTable(costsArray)

    let imprests = daily && daily.imprests
        ? daily.imprests
        : []

    let imprestsSum = 0

    imprests.map(i => {
        imprestsSum += i.sum
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

        {[
            {
                title: 'Предоплаты', addText: 'Внести предоплату', addOnClick: () => console.log('addPrepaid'),
                titles: ['Наименование', 'Сумма', 'Примечание'],
                rows: prepaids,
                rowsValues: ['item', 'sum', 'note'],
                sum: prepaidsSum
            },
            {
                title: 'Товары', addText: 'Продать товар', addOnClick: () => console.log('addGood'),
                titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                rows: sales,
                rowsValues: ['action', 'item', 'sum', 'note'],
                sum: salesSum
            },
            {
                title: 'Работы, услуги', addText: 'Продать услугу', addOnClick: () => console.log('addService'),
                titles: ['#', 'Что сделали', 'Сумма', 'Сотрудник'],
                rows: services,
                rowsValues: ['id', 'item', 'sum', 'user_id'],
                sum: serviceSum
            },
            {
                title: 'Расходы', addText: 'Внести расход, зарплату', addOnClick: () => console.log('addCost'),
                titles: ['Действие', 'Наименование', 'Сумма', 'Примечание'],
                rows: costs,
                rowsValues: ['action', 'item', 'sum', 'note'],
                sum: costSum
            },
            {
                title: 'Подотчеты', addText: 'Внести подотчет', addOnClick: () => console.log('addImprest'),
                titles: ['Наименование', 'Сумма', 'Сотрудник', 'Примечание'],
                rows: imprests,
                rowsValues: ['item', 'sum', 'user_id', 'note'],
                sum: imprestsSum
            },
        ]
            .map(t => date !== today && t.rows === imprests
                ? ''
                : <TableContainer
                key={'tablecontindailykey' + t.title}
                className={classes.table}
                component={Paper}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={t.titles.length - 1}>
                                <Typography variant="h6">
                                    {t.title}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                {date === today && props.app.stock_id === stock
                                    ? <Tooltip title={t.addText}>
                                    <IconButton className={classes.add}
                                                onClick={() => t.addOnClick}
                                    >
                                        <AddCircleIcon/>
                                    </IconButton>
                                </Tooltip>
                                : ''}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableHead>
                        <TableRow>
                            {t.titles.map(t => <TableCell
                                key={'rowsintabledaily' + t}
                            >{t}</TableCell>)}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {t.rows.map(row => <TableRow
                            key={'prepaidstablerowindaily' + t.title + JSON.stringify(row)}
                        >
                            {t.rowsValues.map(v => {

                                let value = row[v]

                                if (v === 'user_id') {

                                    let user = props.app.users.find(u => u.id === row[v])

                                    value = user
                                        ? user.name
                                        : ''

                                }

                                return <TableCell
                                    key={'rowsintabledailysec' + v}
                                >
                                    {value}
                                </TableCell>
                            })}
                        </TableRow>)}
                    </TableBody>

                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={t.titles.length - 2}>
                                Итого:
                            </TableCell>
                            <TableCell>
                                {t.sum}
                            </TableCell>
                        </TableRow>
                    </TableHead>

                </Table>
            </TableContainer>)}

        {daily
            ? <Grid container
                    direction={'column'}
                    justify={'center'}
                    component={Paper}
                    className={classes.totals}
                    spacing={1}
            >
                <Grid item>
                    <Typography variant="h6">
                        Наличные
                    </Typography>
                </Grid>
                {[
                    {text: 'Остаток на утро:', value: daily.morning},
                    {text: 'Выручка:', value: daily.proceeds},
                    {text: 'Подотчеты:', value: daily.imprests},
                    {text: 'Безнал:', value: daily.cashless},
                    {text: 'Сдали:', value: daily.handed},
                    {text: 'Остаток:', value: daily.evening},
                ].map(l => date !== today && l.text === 'Подотчеты:'
                    ? ''
                    : <Grid item
                            key={'griditemkeyindailypertotals' + l.text}
                    >
                        <Typography variant={'subtitle2'}>
                            {l.text + ' ' + l.value}
                        </Typography>
                    </Grid>)}
            </Grid>
            : ''}
    </>

}
export default connect(state => state)(Daily);
