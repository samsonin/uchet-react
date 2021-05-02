import React, {useState} from 'react'
import {connect} from "react-redux";

import {useSnackbar} from 'notistack';

import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TextField from "@material-ui/core/TextField/TextField";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import Autocomplete from "@material-ui/lab/Autocomplete";

import TreeModal from "./TreeModal";
import request from "./Request";

const initialState = () => ({
    currentTr: false,
    consignment: {
        products: [{
            categoryId: 0,
            model: '',
            quantity: 1,
            cost: 0,
            sum: 0,
        }],
        providerId: 0,
        consignmentNumber: '',
        actuallyPaid: 0,
        delivery: 0,
    }
})

const Arrival = props => {

    const [state, setState] = useState(initialState)
    const [isSending, setIsSending] = useState(false)

    const {enqueueSnackbar} = useSnackbar();

    const providerOptions = props.app.providers.map(v => ({id: v.id, name: v.name}))
    providerOptions.unshift({id: 0, name: ''})

    const addConsignment = () => {

        let error;
        if (state.consignment.providerId === 0) error = 'Выберите поставщика';
        if (state.consignment.consignmentNumber === '') error = 'Введите номер накладной';
        state.consignment.products.map(product => {
            if (product.categoryId === 0) error = 'Выберите категорию';
            if (product.model === '') error = 'Введите наименование';
            if (product.quantity === 0) error = 'Количество должно быть больше 0';
            return product;
        })
        if (error !== undefined) {

            return (enqueueSnackbar(error, {
                variant: 'error'
            }))

        }

        setIsSending(true)

        request({
            action: 'addConsignment',
            stock_id: props.app.stock_id,
            consignment: state.consignment
        }, '/arrival', props.auth.jwt)
            .then(data => {

                setIsSending(false)

                if (data.result) {

                    enqueueSnackbar('Внесено ' + data.counter + ' товаров', {
                        variant: 'success',
                    })

                    setState(initialState);

                } else {

                    let message = 'Ошибка';
                    if (data.error === "not authenticated") {
                        message = 'Доступ для пользователя запрещен'
                    }
                    else if (data === 'wrong stock') message = 'Выберите точку';
                    else if (data === 'consignment exist') message = 'Такая накладная уже существует';
                    enqueueSnackbar(message, {
                        variant: 'error'
                    });

                }

            })

    }

    const handleAdd = () => {
        setState(prev => {

            let newState = {...prev};
            newState.consignment.products.push({
                categoryId: 0,
                model: '',
                quantity: 1,
                cost: 0,
                sum: 0,
            });
            return newState

        })
    }

    const handleDelete = i => {
        setState(prev => {

            let newState = {...prev}
            newState.consignment.products.splice(i, 1);
            return newState

        })
    }

    const handleCategories = id => {
        setState(prev => {

            let newState = {...prev};
            if (id) newState.consignment.products[prev.currentTr].categoryId = +id;
            newState.currentTr = false;

            return newState
        })
    }

    const handleTr = (i, index, val) => {
        setState(prev => {

            let newState = {...prev};
            newState.consignment.products[i][index] = index === 'model'
                ? val
                : +val
            if (index === 'cost') newState.consignment.products[i].sum = +val * 2;

            newState.currentTr = false;
            newState.consignment.actuallyPaid = getConsignmentTotal();

            return newState
        })
    }

    const handleProvider = v => {

        setState(prev => {
            let id = 0;
            try {
                id = v.id;
            } catch (e) {
            }
            let newState = {...prev};
            newState.consignment.providerId = id;
            return newState
        })

    }

    const handleTotals = (index, val) => {

        if (val < 0) return;

        setState(prev => {
            let newState = {...prev};
            newState.consignment[index] = val;
            return newState
        })

    }

    const getConsignmentTotal = () => {
        let consignmentTotal = 0;
        state.consignment.products.map(product => {
            consignmentTotal += product.quantity * product.cost;
            return product;
        })
        return consignmentTotal;
    }

    const getTotal = () => {
        return state.consignment.delivery + getConsignmentTotal();
    }

    const renderTr = (i, product) => {

        return <TableRow key={'gberbrv' + i}>
            <TableCell component="th" scope="row" className={"p-1"}>
                <Button size="small" className="w-100" variant="outlined"
                        onClick={() => setState(prev => ({...prev, currentTr: i}))}>
                    {product.categoryId > 0
                        ? props.app.categories.find(v => v.id === product.categoryId).name
                        : "выбрать..."}
                </Button>
            </TableCell>
            <TableCell className={"p-1"}>
                <TextField className={"w-100"}
                           onChange={e => handleTr(i, 'model', e.target.value)}
                           value={product.model}
                />
            </TableCell>
            <TableCell align="center" className={"p-1"}>
                <TextField
                    onChange={e => handleTr(i, 'quantity', e.target.value)}
                    type="number"
                    value={product.quantity}
                />
            </TableCell>
            <TableCell align="center" className={"p-1"}>
                <TextField
                    onChange={e => handleTr(i, 'cost', e.target.value)}
                    type="number"
                    value={product.cost}
                />
            </TableCell>
            <TableCell align="center" className={"p-1"}>
                <TextField
                    onChange={e => handleTr(i, 'sum', e.target.value)}
                    type="number"
                    value={product.sum}
                />
            </TableCell>
            <TableCell align="center" className={"p-1"}>
                <Tooltip title="Удалить строку">
                    <IconButton className="p-2 m-2" onClick={() => handleDelete(i)}>
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    }

    return (+props.app.stock_id <= 0)
        ? <Typography variant="h5" align="center">Выберите точку</Typography>
        : <>

            <TreeModal isOpen={state.currentTr !== false} onClose={handleCategories}/>

            <Grid container
                // spacing={3}
                  direction="column"
                  justify="space-between"
                  alignContent="center">
                <Grid item>
                    <Typography variant="h5">Новая накладная</Typography>
                </Grid>
                <Grid item>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} className="pt-3">

                                        <Autocomplete
                                            value={providerOptions.find(v => v.id === state.consignment.providerId)}
                                            options={providerOptions}
                                            onChange={
                                                (_, newValue) => handleProvider(newValue)
                                            }
                                            getOptionLabel={option => option.name}
                                            getOptionSelected={option => option.id}
                                            renderInput={
                                                params => <TextField {...params} label="Поставщик"/>
                                            }
                                        />

                                    </TableCell>
                                    <TableCell colSpan={4} className="pt-3">
                                        <TextField label="Накладная"
                                                   value={state.consignment.consignmentNumber}
                                                   onChange={e => handleTotals('consignmentNumber', e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="center" style={{width: "30%"}}>Категория </TableCell>
                                    <TableCell align="center" style={{width: "35%"}}>Наименование</TableCell>
                                    <TableCell align="center">Кол-во</TableCell>
                                    <TableCell align="center">Себ-ть</TableCell>
                                    <TableCell align="center">Цена</TableCell>
                                    <TableCell align="center" className={"p-1"}>
                                        <Tooltip title="Добавить строку">
                                            <IconButton className="p-2 m-2" onClick={() => handleAdd()}>
                                                <AddCircleIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {state.consignment.products.map((product, i) => renderTr(i, product))}
                                <TableRow>
                                    <TableCell align="center" className="pt-3">
                                        <TextField label="Итого по накладной"
                                                   disabled value={getConsignmentTotal()}
                                        />
                                    </TableCell>
                                    <TableCell align="center" className="pt-3">
                                        <TextField label="Доставка"
                                                   type="number" min={0}
                                                   value={state.consignment.delivery}
                                                   onChange={e => handleTotals('delivery', +e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell colSpan="2" align="center" className="pt-3">
                                        <TextField label="Итого с доставкой"
                                                   disabled value={getTotal()}
                                        />
                                    </TableCell>
                                    <TableCell colSpan="2" align="center" className="pt-3">
                                        <TextField label="Оплатили"
                                                   type="number"
                                                   value={state.consignment.actuallyPaid}
                                                   onChange={e => handleTotals('actuallyPaid', +e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item>
                    <Grid container justify='center'>
                        <Button
                            style={{
                                margin: '1rem',
                            }}
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={isSending}
                            onClick={() => addConsignment()}
                        >
                            Внести
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </>

}

export default connect(state => state)(Arrival);
