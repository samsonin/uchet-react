import React, {forwardRef, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SaleModal = props => {

    const [absents, setAbsents] = useState()
    const [name, setName] = useState('')

    const {enqueueSnackbar} = useSnackbar()

    const handleTry = () => {

        rest('resale/' + props.current_stock_id + '/' + props.row.id, 'PATCH',
            {name})
            .then(res => {

                if (res.status === 200) {

                    setAbsents(res.body)

                } else {

                    enqueueSnackbar('ошибка', {
                        variant: 'error'
                    })

                    close()

                }
            })


    }

    const close = () => {
        setName('')
        setAbsents(undefined)
        props.close()
    }

    return props.row
        ? <Dialog
            open={props.isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => close()}
        >
            <DialogTitle>
                {props.row.item}
            </DialogTitle>
            <DialogContent>
                {absents
                    ? absents.length
                        ? <>
                            <DialogContentText>
                                Найдно несколько подходящих товаров, выберите один для замены
                            </DialogContentText>
                            <FormControl className="w-100 m-1">
                                <InputLabel id="sale-modal-select-label">Выбрать...</InputLabel>
                                <Select
                                    labelId={'sale-modal-select-label'}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                >
                                    {absents.map(name => <MenuItem key={name} value={name}>
                                        {name}
                                    </MenuItem>)}
                                </Select>
                            </FormControl>
                        </>
                        : <DialogContentText>
                            Товары для замены не найдены
                        </DialogContentText>

                    : <>
                        <DialogContentText>
                            Данная запись внесена без списания товара со склада!
                        </DialogContentText>
                        <DialogContentText>
                            Можно попробовать найти соответствующий товар в базе и перезаписать продажу
                        </DialogContentText>
                    </>}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => close()} color="secondary">
                    Отказаться
                </Button>
                {(absents && !absents.length) || <Button onClick={handleTry} color="primary">
                    Попробовать
                </Button>}
            </DialogActions>
        </Dialog>
        : ''
}

export default connect(state => state.app)(SaleModal);