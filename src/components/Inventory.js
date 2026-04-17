import React, {forwardRef, useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {Fade, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@mui/material";
import rest from "./Rest";
import TwoLineInCell from "./common/TwoLineInCell";
import IconButton from "@mui/material/IconButton";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import {intInputHandler} from "./common/InputHandlers";
import IsPublicCheckBox from "./common/IsPublicCheckBox";
import {useSnackbar} from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import {v4 as uuidv4} from 'uuid';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const Inventory = props => {

    const [goods, setGoods] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [hide, setHide] = useState(false)

    const [model, setModel] = useState('')
    const [imei, setImei] = useState('')
    const [sum, setSum] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [place, setPlace] = useState('')
    const [error, setError] = useState(false)
    const currentId = useRef()

    const {enqueueSnackbar} = useSnackbar()

    useEffect(() => {

        rest('goods/showcase')
            .then(res => {
                if (res.status === 200) {
                    setGoods(res.body)
                }
            })

    }, [])

    useEffect(() => {
        setError(false)
    }, [imei, sum, place])

    const setStorage = id => {

        currentId.current = id

        const g = goods.find(g => g.id === id)

        if (g.storage) return saveStorage(false, '')

        setModel(g.model)
        setImei(g.imei)
        setSum(g.sum)
        setIsPublic(g.parts === 'sale')

        return setIsOpen(true)

    }

    const saveStorage = (isInStock, place) => {

        const data = {
            isInStock,
            isPublic
        }

        if (isInStock) {

            if (!place || !imei) {

                enqueueSnackbar('Заполните все поля', {variant: 'error'})

                return setError(true)

            }

            data.place = place

        }

        const showcase = goods.find(g => g.id === currentId.current)

        if (showcase) {

            if (model !== showcase.model) data.model = model
            if (imei !== showcase.imei) data.imei = imei
            if (sum !== showcase.sum) data.sum = sum

        }

        rest('goods/showcase/' + props.app.current_stock_id + '/' + currentId.current, 'PATCH', data)
            .then(res => {

                if (res.status === 200) {

                    setIsOpen(false)

                    const prev = goods.map(g => {
                        if (g.id === currentId.current) g.storage = isInStock ? 'instock' : ''
                        return g
                    })

                    setGoods(prev)

                }

            })


    }

    const lengthControl = val => val.length > 255 ? val.substring(0, 255) : val

    const strChange = (f, e) => f(lengthControl(e.target.value))

    return <>

        <Dialog
            open={isOpen}
            slots={{ transition: Transition }}
            keepMounted
            onClose={() => setIsOpen(false)}
        >
            <DialogContent>
                {[
                    {label: "Модель", value: model, onChange: e => strChange(setModel, e)},
                    {label: "imei S/N", value: imei, onChange: e => strChange(setImei, e)},
                    {label: "Цена", value: sum, onChange: e => intInputHandler(e.target.value, setSum)},
                    {label: "Место хранения", value: place, onChange: e => strChange(setPlace, e)},
                ].map(f => <TextField
                    key={'dialog-content-in-inventory-' + f.label}
                    style={{
                        margin: '1rem .3rem',
                        width: '95%'
                    }}
                    label={f.label}
                    value={f.value}
                    onChange={f.onChange}
                    error={!f.value && error}
                />)}
                <IsPublicCheckBox value={isPublic} onChange={() => setIsPublic(!isPublic)}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIsOpen(false)} color="secondary">
                    Отмена
                </Button>
                <Button onClick={() => saveStorage(true, place)} color="primary">
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>

        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
        }}>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={hide}
                        onChange={() => setHide(!hide)}
                        color="primary"
                    />
                }
                label="Скрыть учтенные"
            />

            <TextField slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setSearch('')}>
                                <CloseIcon/>
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
                       value={search}
                       onChange={e => setSearch(e.target.value)}
            />

        </div>

        <Table size="small"
               style={{
                   background: 'white'
               }}
        >
            <TableHead>
                <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Группа</TableCell>
                    <TableCell>Наименование / imei</TableCell>
                    <TableCell>Цена</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {goods.length
                    ? goods.filter(g => !props.app.current_stock_id || props.app.current_stock_id === g.stock_id)
                        .filter(g => {
// eslint-disable-next-line
                            if (!search || g.sum == search || g.id == search) return true

                            const model = g.model.toLowerCase()
                            const imei = g.imei.toLowerCase()
                            const sum = g.imei.toLowerCase()

                            let r = true

                            search.toLowerCase()
                                .split(' ')
                                .map(s => {

                                    if (model.indexOf(s) < 0 && imei.indexOf(s) < 0 && sum.indexOf(s) < 0) {
                                        r = false
                                    }

                                })

                            return r

                        })
                        .filter(g => !g.storage || hide === !g.storage)
                        .map(g => {

                            const isInStock = g.storage === 'instock'

                            return (<Fade key={uuidv4()}
                                in={true}
                                timeout={1000}
                            >
                                <TableRow style={{
                                              cursor: 'pointer',
                                              backgroundColor: isInStock
                                                  ? 'green'
                                                  : 'white'
                                          }}
                                          onClick={() => {
                                          }}
                                >
                                    <TableCell>{g.id}</TableCell>
                                    <TableCell>{g.group}</TableCell>
                                    <TableCell>
                                        {TwoLineInCell(g.model, g.imei)}
                                    </TableCell>
                                    <TableCell>
                                        {g.sum}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => setStorage(g.id)}
                                        >
                                            {isInStock
                                                ? <CheckBoxIcon/>
                                                : <CheckBoxOutlineBlankIcon/>}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </Fade>)
                        })
                    : ''}
            </TableBody>
        </Table>
    </>
}

export default connect(state => state)(Inventory)
