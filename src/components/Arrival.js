import React, {useEffect, useRef, useState} from 'react'
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
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {Link} from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
    const [product, setProduct] = useState()

    const [isExists, setIsExists] = useState(false)

    const [isScanOpen, setIsScanOpen] = useState(false)
    const [scanValue, setScanValue] = useState('')
    const [imprestId, setImprestId] = useState(0)
    const [isRequesting, setIsRequesting] = useState(false)

    const [productOption, setProductOption] = useState([])
    const [productNameLoading, setProductNameLoading] = useState(false)

    const scanRef = useRef()
    const scanTr = useRef(0)

    const {enqueueSnackbar} = useSnackbar();

    const providerOptions = props.app.providers.map(p => ({id: p.id, name: p.name}))
    providerOptions.unshift({id: 0, name: ''})

    useEffect(() => {

        if (isScanOpen) setTimeout(() => {

            scanRef.current.focus()

        }, 500)

    }, [isScanOpen])

    useEffect(() => {

        if (!props.newScan || isScanOpen) return

        if (state.consignment.products.find(p => p.barcode === props.newScan)) {

            enqueueSnackbar('Уже внесли', {variant: 'info'})

            return

        }

        if (!state.consignment.products.find((tr, i) => {

            if (!(tr.barcode || tr.categoryId || tr.model || tr.cost || tr.sum)) {

                scanTr.current = i
                scanDone(props.newScan)
                return true

            }

            return false

        })) {

            scanTr.current = state.consignment.products.length
            handleAdd(props.newScan)
            getProduct(props.newScan)

        }
// eslint-disable-next-line
    }, [props.newScan])

    useEffect(() => {

        if (props.enterPress) addConsignment()
// eslint-disable-next-line
    }, [props.enterPress])

    useEffect(() => {

        if (product) {

            console.log('scanTr', scanTr)

            if (product.categoryId) {

                handleTr(scanTr.current, 'categoryId', product.categoryId || product.categories[0])

            }

            if (product.barcode) {

                handleTr(scanTr.current, 'barcode', product.barcode)

            }

        }
// eslint-disable-next-line
    }, [product])

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

        rest('consignments/' + props.app.stock_id, 'POST', {...state.consignment, imprestId})
            .then(res => {

                setIsRequesting(false)

                if (res.status === 200) {

                    setState(initialState)
                    setImprestId(0)

                    return enqueueSnackbar('Ok, внесено!', {
                        variant: 'success'
                    })

                }

                let message = res.error === 'consignment already exist'
                    ? 'Такая накладная уже существует'
                    : res.error === 'stock not allowed'
                        ? 'Доступ для пользователя запрещен'
                        : 'Ошибка'

                return enqueueSnackbar(res.status + ' ' + message, {
                    variant: 'error'
                })

            })
    }

    const handleAdd = barcode => {

        setState(prev => {

            let newState = {...prev};
            newState.consignment.products.push({...emptyTr, barcode});
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

        scanTr.current = i

        setScanValue(state.consignment.products[i].barcode)

        setIsScanOpen(true)

    }

    const scanDone = barcode => {

        handleTr(scanTr.current, 'barcode', barcode)

        setIsScanOpen(false)

        getProduct(barcode)
    }

    const getProduct = barcode => {

        setIsRequesting(true)

        rest('products/' + barcode)
            .then(res => {

                setIsRequesting(false)

                if (res.status === 200) {

                    handleTr(scanTr.current, 'model', res.body.name)
                    handleTr(scanTr.current, 'categoryId', res.body.categories[0])
                    handleTr(scanTr.current, 'isInBase', true)

                    enqueueSnackbar(res.body.name, {
                        variant: 'success'
                    })

                } else {

                    handleTr(scanTr.current, 'isInBase', false)

                    enqueueSnackbar('нет в базе', {
                        variant: 'warning'
                    })

                }

            })


    }

    const handleCategories = id => {

        handleTr(state.currentTr, 'categoryId', id)

    }

    const toNumber = val => +val < 0 || isNaN(+val)
        ? 0
        : +val

    const productHandler = (name, reason, i) => {

        handleTr(i, 'model', name)

        if (reason !== 'input' || name.length < 4 || productNameLoading) return

        setProductNameLoading(true)

        rest('products?name=' + name)
            .then(res => {

                setProductNameLoading(false)

                if (res.status === 200) {

                    setProductOption(res.body)

                }

            })

    }

    const handleTr = (i, index, val) => {
        setState(prev => {

            let newState = {...prev};
            newState.consignment.products[i][index] = ['barcode', 'isInBase', 'model'].includes(index)
                ? val
                : toNumber(val)

            if (index === 'cost') newState.consignment.products[i].sum = toNumber(val) * 2

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

        setState(prev => {
            let newState = {...prev};
            newState.consignment[index] = index === 'consignmentNumber'
                ? val
                : toNumber(val);
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

    const getTotal = () => state.consignment.delivery + getConsignmentTotal();

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
                    disabled={product.isInBase}
                    onClick={() => setState(prev => ({...prev, currentTr: i}))}
            >
                {product.categoryId > 0
                    ? props.app.categories.find(v => v.id === product.categoryId).name
                    : "выбрать..."}
            </Button>
        </TableCell>
        <TableCell className={"p-1"}>

            <Autocomplete
                value={{name: product.model}}
                options={productOption}
                loading={productNameLoading}
                onInputChange={(e, v, r) => productHandler(v, r, i)}
                onChange={(e, v) => setProduct(v)}
                getOptionLabel={option => option.name}
                getOptionSelected={option => option.name}
                renderInput={params => <TextField {...params} />}
                disabled={product.isInBase}
            />

        </TableCell>
        <TableCell align="center" className={"p-1"}>
            <TextField
                onChange={e => handleTr(i, 'quantity', e.target.value)}
                value={product.quantity}
            />
        </TableCell>
        <TableCell align="center" className={"p-1"}>
            <TextField
                onChange={e => handleTr(i, 'cost', e.target.value)}
                value={product.cost}
            />
        </TableCell>
        <TableCell align="center" className={"p-1"}>
            <TextField
                onChange={e => handleTr(i, 'sum', e.target.value)}
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

    console.log('props.back', props.back)

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
                        <MDBBtn color="primary" onClick={() => scanDone(scanValue)}>
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
                  direction="column"
                  style={{marginLeft: '1rem'}}
                  alignContent="center">

                <Grid container
                      style={{margin: '1rem'}}
                      justify="space-between"
                >

                    {isExists
                        ? <Grid item>
                            {props.back
                            ? <Tooltip title={'Назад'}>
                                <Link to={props.back}>
                                    <IconButton>
                                        <ArrowBackIcon/>
                                    </IconButton>
                                </Link>
                            </Tooltip>
                            : ''}
                        </Grid>
                        : <Grid item>
                            <Typography variant="h5">Новая накладная</Typography>
                        </Grid>}

                    <Grid item>
                        <Tooltip title="Удалить">
                            <IconButton
                                // onClick={() => props.remove()}
                            >
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    </Grid>
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
                                                   value={state.consignment.delivery}
                                                   onChange={e => handleTotals('delivery', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell colSpan="2" align="center" className="pt-3">
                                        <TextField label="Итого с доставкой"
                                                   disabled value={getTotal()}
                                        />
                                    </TableCell>
                                    <TableCell colSpan="2" align="center" className="pt-3">
                                        <TextField label="Оплатили"
                                                   value={state.consignment.actuallyPaid}
                                                   onChange={e => handleTotals('actuallyPaid', e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>

                                {dailyReport && dailyReport.imprests && <TableRow>
                                    <TableCell align="center" className="pt-3" colSpan={3}>
                                        <FormControl className="w-100">
                                            <InputLabel id="arrival-imprests-control-select-outlined-label">
                                                Учесть подотчет
                                            </InputLabel>
                                            <Select
                                                labelId="arrival-imprests-control-select-outlined-label"
                                                value={imprestId}
                                                onChange={e => setImprestId(e.target.value)}
                                                className="justify-content-between"
                                            >
                                                <MenuItem key={'menuitimorestscontrollinarrival'}
                                                          value={0}
                                                >
                                                    <br/>
                                                </MenuItem>
                                                {dailyReport.imprests.map(i => <MenuItem
                                                    key={'menuitimorestscontrollinarrival' + i.id}
                                                    value={i.id}
                                                    className="justify-content-between"
                                                >
                                                    <span className="p-2 font-weight-bold">
                                                        {props.app.users.find(u => u.id === i.ui_user_id).name}
                                                    </span>
                                                    {i.item}
                                                    <span className="p-2 font-weight-bold">
                                                        {i.sum}
                                                    </span>
                                                </MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>}

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
            </Grid>

        </>
        : <Typography variant="h5">Выберите точку</Typography>
}

export default connect(state => state)(Arrival);