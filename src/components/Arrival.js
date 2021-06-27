import React, {useContext, useEffect, useRef, useState} from 'react'
import {connect} from "react-redux";
import Context from "../context";

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
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CropFreeIcon from '@material-ui/icons/CropFree';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import Autocomplete from "@material-ui/lab/Autocomplete";

import TreeModal from "./TreeModal";
import rest from "../components/Rest";
import {MDBBtn, MDBContainer, MDBModal, MDBModalBody, MDBModalFooter, MDBModalHeader} from "mdbreact";
import {bindActionCreators} from "redux";
import {initScan} from "../actions/actionCreator";

const mapDispatchToProps = dispatch => bindActionCreators({initScan}, dispatch);

const emptyTr = {
    barcode: '',
    isInBase: false,
    categoryId: 0,
    model: '',
    quantity: 1,
    cost: 0,
    sum: 0,
}

const initialState = () => ({
    currentTr: false,
    consignment: {
        products: [
            {...emptyTr}
        ],
        providerId: 0,
        consignmentNumber: '',
        actuallyPaid: 0,
        delivery: 0,
    }
})

const Arrival = props => {

    const [state, setState] = useState(initialState)
    const [isScanOpen, setIsScanOpen] = useState(false)
    const [scanTr, setScanTr] = useState(0)
    const [scanValue, setScanValue] = useState('')
    const [isRequesting, setIsRequesting] = useState(false)

    const scanRef = useRef()

    const {enqueueSnackbar} = useSnackbar();

    const providerOptions = props.app.providers.map(p => ({id: p.id, name: p.name}))
    providerOptions.unshift({id: 0, name: ''})

    useEffect(() => {

        console.log('from Arrival useEffect props', props)

        const {initScan} = props

        initScan()

    }, [])

    useEffect(() => {

        if (!isScanOpen) return

        setTimeout(() => {

            scanRef.current.focus()

        }, 500)

    }, [isScanOpen]);

    const addTrByScan = barcode => {

        handleAdd()

        setScanTr(1)
        setScanValue(barcode)

        scanDone()

    }

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

        if (error) return (enqueueSnackbar(error, {
            variant: 'error'
        }))

        setIsRequesting(true)

        rest('consignments/' + props.app.stock_id, 'POST', state.consignment)
            .then(res => {

                setIsRequesting(false)

                if (res.status === 200) {

                    setState(initialState)

                    return enqueueSnackbar('Ok, внесено!', {
                        variant: 'success'
                    })

                }

                let message = res.body.error === 'consignment already exist'
                    ? 'Такая накладная уже существует'
                    : res.body.error === 'stock not allowed'
                        ? 'Доступ для пользователя запрещен'
                        : 'Ошибка'

                return enqueueSnackbar(res.status + ' ' + message, {
                    variant: 'error'
                })

            })
    }

    const handleAdd = () => {
        setState(prev => {

            let newState = {...prev};
            newState.consignment.products.push({...emptyTr});
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

    const handleScan = i => {

        setScanTr(i)

        setScanValue(state.consignment.products[i].barcode)

        setIsScanOpen(true)

    }

    const scanDone = () => {

        handleTr(scanTr, 'barcode', scanValue)

        setIsScanOpen(false)

        setIsRequesting(true)

        rest('products/' + scanValue)
            .then(res => {

                setIsRequesting(false)

                if (res.status === 200) {

                    handleTr(scanTr, 'model', res.body.name)
                    handleTr(scanTr, 'categoryId', res.body.categories[0])
                    handleTr(scanTr, 'isInBase', true)

                    enqueueSnackbar(res.body.name, {
                        variant: 'success'
                    })

                } else {

                    handleTr(scanTr, 'isInBase', false)

                    enqueueSnackbar('нет в базе', {
                        variant: 'warning'
                    })

                }

            })

    }

    const handleCategories = id => {

        handleTr(state.currentTr, 'categoryId', id)

    }

    const handleTr = (i, index, val) => {
        setState(prev => {

            let newState = {...prev};
            newState.consignment.products[i][index] = ['barcode', 'isInBase', 'model'].includes(index)
                ? val
                : +val
            if (index === 'cost') newState.consignment.products[i].sum = +val * 2

            newState.currentTr = false;
            newState.consignment.actuallyPaid = getConsignmentTotal();

            return newState
        })
    }

    const handleProvider = p => {

        setState(prev => {
            let newState = {...prev};
            newState.consignment.providerId = p ? p.id : 0
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

    const renderTr = (i, product) => <TableRow key={'gberbrv' + i}>
        <TableCell align="center" className={"p-1"}>
            <Tooltip title="Сканировать">
                <IconButton className="p-2 m-2" onClick={() => handleScan(i)}>
                    {product.barcode
                        ? product.isInBase
                            ? <DoneAllIcon/>
                            : <DoneIcon/>
                        : <CropFreeIcon/>}
                </IconButton>
            </Tooltip>
        </TableCell>
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

    const currentTr = state.consignment.products[state.currentTr]

    const dailyReport = props.app.daily.find(d => d.stock_id === props.app.stock_id)

    console.log(dailyReport)

    return props.app.stock_id
        ? <>

            <MDBContainer>
                <MDBModal isOpen={isScanOpen} toggle={() => setIsScanOpen(false)}>
                    <MDBModalHeader toggle={() => setIsScanOpen(false)}>
                        Просканируйте или введите штрихкод
                    </MDBModalHeader>
                    <MDBModalBody>
                        <TextField className={"w-100"}
                                   value={scanValue}
                                   onChange={e => setScanValue(e.target.value)}
                                   inputRef={scanRef}
                        />
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color="secondary" onClick={() => setIsScanOpen(false)}>
                            Отмена
                        </MDBBtn>
                        <MDBBtn color="primary" onClick={() => scanDone()}>
                            Сохранить
                        </MDBBtn>
                    </MDBModalFooter>
                </MDBModal>
            </MDBContainer>

            <TreeModal isOpen={state.currentTr !== false}
                       onClose={handleCategories}
                       initialCategoryId={currentTr
                           ? currentTr.categoryId
                           : 0}
            />

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
                                    <TableCell colSpan={3} className="pt-3">

                                        <Autocomplete
                                            value={providerOptions.find(v => v.id === state.consignment.providerId)}
                                            options={providerOptions}
                                            onChange={
                                                (_, v) => handleProvider(v)
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
                                    <TableCell align="center" style={{width: "10%"}}>

                                    </TableCell>
                                    <TableCell align="center" style={{width: "30%"}}>
                                        Категория
                                    </TableCell>
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
                            disabled={isRequesting}
                            onClick={() => addConsignment()}
                        >
                            Внести
                        </Button>
                    </Grid>
                </Grid>

                {dailyReport && dailyReport.imprests && dailyReport.imprests.map(i => {

                    console.log(i)

                })}

            </Grid>

        </>
        : <Typography variant="h5">Выберите точку</Typography>
}

export default connect(state => state, mapDispatchToProps)(Arrival);
