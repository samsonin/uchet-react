import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {connect} from "react-redux";
import {useSnackbar} from "notistack";
import Fields from "./customer/Fields";
import rest from "./Rest";
import {bindActionCreators} from "redux";
import {upd_app} from "../actions/actionCreator";
import {
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Table,
    TableBody,
    TableContainer,
    TextField
} from "@material-ui/core";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import {intInputHandler} from "./common/InputHandlers";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";


const mapDispatchToProps = dispatch => bindActionCreators({
    upd_app
}, dispatch);

const pic = {
    categoryId: 0,
    model: '',
    imei: '',
    sum: 0,
    isSale: false,
}

const Buy = props => {

    const {enqueueSnackbar} = useSnackbar()

    const needPrint = useRef(false)

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const full = d => d < 10 ? '0' + d : d

    const [isNeedDoc, setIsNeedDocs] = useState(false)

    const [customer, setCustomer] = useState({})
    const [showcase, setShowcase] = useState([{...pic}])

    const doc = props.app.docs.find(d => d.name === 'buy')

    const save = () => {

        rest('showcase', 'POST', {
            customer,
            showcase
        })
            .then(res => {
                if (res.status === 200) {

                }
            })

    }

    const handleChange = (name, value) => {

        if (customer.id) return

        const newCustomer = {...customer}
        newCustomer[name] = value
        setCustomer(newCustomer)

    }

    const add = () => {

        const prev = [...showcase]
        prev.push({...pic})
        setShowcase(prev)

    }

    const sub = i => {

        if (showcase.length < 2) return
        const prev = [...showcase]
        prev.splice(i, 1)
        setShowcase(prev)

    }

    const handler = (i, value, name) => {

        const prev = [...showcase]
        const set = v => prev[i][name] = v

        name === 'sum'
            ? intInputHandler(value, set)
            : set(value)

        setShowcase(prev)

    }

    const destinationHandler = i => {

        const prev = [...showcase]
        prev[i].isSale = !prev[i].isSale
        setShowcase(prev)

    }

    const categories = [
        {id: 0, name: ''},
        {id: 5, name: 'Телефон'},
        {id: 41, name: 'Планшет'},
        {id: 38, name: 'Ноутбук'},
    ]

    let total = 0

    return <>


        <FormControlLabel
            control={<Checkbox
                checked={isNeedDoc}
                onChange={() => setIsNeedDocs(!isNeedDoc)}
                inputProps={{'aria-label': 'primary checkbox'}}
            />}
            label="оформить договор"
        />

        {isNeedDoc && <Fields
            customer={customer}
            setCustomer={setCustomer}
            handleChange={handleChange}
            fieldsStyle={{
                margin: '.4rem',
                width: '100%',
            }}
        />}

        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Категория
                        </TableCell>
                        <TableCell>
                            Модель
                        </TableCell>
                        <TableCell>
                            imei, S/N
                        </TableCell>
                        <TableCell>
                            Сумма
                        </TableCell>
                        <TableCell>
                            Назначение
                        </TableCell>
                        <TableCell>
                            <Tooltip title={'Добавить'}>
                                <IconButton onClick={() => add()}>
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {showcase.map((s, si) => {

                        total += s.sum

                        return <TableRow key={'item-key-in-showcase-buy' + si}>
                            {[
                                <Select value={s.categoryId}
                                        onChange={e => handler(si, e.target.value, 'categoryId')}
                                >
                                    {categories.map(c => {

                                        return <MenuItem key={'menu-item-in-buy' + c.id}
                                                         value={c.id}>
                                            {c.name || <br />}
                                        </MenuItem>
                                    })}

                                    <MenuItem key={'menu-item-in-buy1000'}
                                              value={1000}>
                                        Другая категория...
                                    </MenuItem>
                                </Select>,
                                <TextField
                                    value={s.model}
                                    onChange={e => handler(si, e.target.value, 'model')}
                                />,
                                <TextField
                                    value={s.imei}
                                    onChange={e => handler(si, e.target.value, 'imei')}
                                />,
                                <TextField
                                    value={s.sum}
                                    onChange={e => handler(si, e.target.value, 'sum')}
                                />,
                                <Button variant="contained"
                                        size='small'
                                        color={s.isSale ? 'primary' : 'secondary'}
                                        onClick={() => destinationHandler(si)}
                                >
                                    {s.isSale ? 'Продажа' : 'Проверка'}
                                </Button>,
                                <Tooltip title={'Удалить'}>
                                    <IconButton onClick={() => sub(si)}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </Tooltip>
                            ].map((c, ci) => <TableCell key={'item-key-in-showcase-buy' + ci}>
                                {c}
                            </TableCell>)}
                        </TableRow>
                    })}
                    <TableRow>
                        <TableCell colSpan={4}>
                            Всего: {total}
                        </TableCell>
                        <TableCell colSpan={2}>
                            <Button onClick={() => save()}
                                    size="small"
                                    variant="contained"
                                    color="primary">
                                Внести
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
}

export default connect(state => state, mapDispatchToProps)(Buy)