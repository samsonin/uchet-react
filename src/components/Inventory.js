import React, {forwardRef, useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@material-ui/core";
import rest from "./Rest";
import TwoLineInCell from "./common/TwoLineInCell";
import IconButton from "@material-ui/core/IconButton";
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import {intInputHandler} from "./common/InputHandlers";
import IsPublicCheckBox from "./common/IsPublicCheckBox";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const Inventory = props => {

    const [goods, setGoods] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [model, setModel] = useState('')
    const [imei, setImei] = useState('')
    const [sum, setSum] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [place, setPlace] = useState('')
    const currentId = useRef()

    useEffect(() => {

        rest('goods/showcase')
            .then(res => {
                if (res.status === 200) {
                    setGoods(res.body)
                }
            })

    }, [])

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

        const data = {isInStock: isInStock}

        if (isInStock) data.place = place

        rest('goods/showcase/' + props.app.stock_id + '/' + currentId.current, 'PATCH', data)
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

    return <>

        <Dialog
            open={isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setIsOpen(false)}
        >
            <DialogContent>
                {[
                    {label: "Модель", value: model, onChange: null},
                    {label: "imei S/N", value: imei, onChange: e => setImei(lengthControl(e.target.value))},
                    {label: "цена", value: sum, onChange: e => intInputHandler(e.target.value, setSum)},
                    {label: "Место хранения", value: place, onChange: e => setPlace(lengthControl(e.target.value))},
                ].map(f => <TextField style={{
                    margin: '1rem .3rem',
                    width: '95%'
                }}
                                      label={f.label}
                                      value={f.value}
                                      onChange={f.onChange}
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
                    ? goods.filter(g => !props.app.stock_id || props.app.stock_id === g.stock_id)
                        .map(g => {

                            const isInStock = g.storage === 'instock'

                            return <TableRow key={'table-row-in-inventory' + g.id}
                                             style={{
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
                        })
                    : ''}
            </TableBody>
        </Table>
    </>
}

export default connect(state => state)(Inventory)