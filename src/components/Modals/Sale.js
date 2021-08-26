import React, {forwardRef, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SaleModal = props => {

    const [absents, setAbsents] = useState()
    const [name, setName] = useState('')

    const {enqueueSnackbar} = useSnackbar()

    const handleTry = () => {

        rest('resale/' + props.stock_id + '/' + props.row.id, 'PATCH',
            {name})
            .then(res => {

                if (res.status === 200) {

                    setAbsents(res.body)

                } else {

                    enqueueSnackbar('ошибка', {
                        variant: 'error'
                    })

                    props.close()

                }
            })


    }

    return props.row
        ? <Dialog
            open={props.isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => props.close()}
        >
            <DialogTitle>
                {props.row.item}
            </DialogTitle>
            <DialogContent>
                {absents
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
                <Button onClick={() => props.close()} color="primary">
                    Отказаться
                </Button>
                <Button onClick={handleTry} color="primary">
                    Попробовать
                </Button>
            </DialogActions>
        </Dialog>
        : ''
}

export default connect(state => state.app)(SaleModal);