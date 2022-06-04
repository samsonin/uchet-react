import React, {useEffect, useRef, useState} from 'react';
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
import {createDate, Print} from "./common/Print";


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

    const [isRequesting, setIsRequesting] = useState(false)
    const [isNeedDoc, setIsNeedDocs] = useState(false)
    const [customer, setCustomer] = useState({})
    const [showcase, setShowcase] = useState([{...pic}])
    const [done, setDone] = useState(false)

    const save = () => {

        let error

        if (!props.app.stock_id) error = 'выберите точку'
        else showcase.map(s => {
            if (!s.categoryId || !s.model || !s.imei) {
                error = 'заполните все поля'
            }
        })

        if (error) return enqueueSnackbar(error, {variant: 'error'})

        setIsRequesting(true)

        rest('goods/showcase/' + props.app.stock_id, 'POST', {
            customer,
            showcase
        })
            .then(res => {

                setIsRequesting(false)

                if (res.status === 200) {

                    setDone(true)

                    if (isNeedDoc) {

                        const doc = props.app.docs.find(d => d.name === 'buy')

                        const stock = props.app.stocks.find(s => s.id === props.app.stock_id)

                        let table = '<table border="1"><thead><tr>' +
                            '<th>Группа</th><th>Модель</th><th>Идентификатор</th><th>Сумма</th></tr></thead><tbody>'
                        let sum = 0
                        showcase.map(s => {

                            table += '<tr><td>' + s.categoryId + '</td><td>' + s.model + '</td>' +
                                '<td>' + s.imei + '</td><td>' + s.sum + '</td></tr>'
                            sum += s.sum

                        })
                        table += '</tbody></table>'

                        const alias = {
                            organization_organization: props.app.organization.organization,
                            organization_legal_address: props.app.organization.legal_address,
                            organization_inn: props.app.organization.inn,
                            access_point_address: stock.address || '',
                            access_point_phone_number: stock.phone_number || '',
                            today: createDate(),
                            fio: customer.fio,
                            phone_number: customer.phone_number,
                            birthday: customer.birthday ? createDate(customer.birthday) : '',
                            doc_sn: customer.doc_sn,
                            doc_date: customer.doc_date ? createDate(customer.doc_date) : '',
                            doc_division_name: customer.doc_division_name,
                            address: customer.address,
                            sum,
                            all_model: table
                        }

                        Print(doc, alias, '', props.history.push('/showcase'))

                    }

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
                                <IconButton
                                    disabled={isRequesting}
                                    onClick={() => add()}
                                >
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
                                            {c.name || <br/>}
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
                                    <IconButton
                                        disabled={isRequesting}
                                        onClick={() => sub(si)}
                                    >
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
                                    disabled={isRequesting || done}
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