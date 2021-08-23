import React, {forwardRef, useEffect, useState} from "react";

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

const ImprestModal = props => {

    const {enqueueSnackbar} = useSnackbar()

    return props.row
        ? <Dialog
            open={props.isOpen}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => props.close()}
        >
            <DialogTitle>
                Подотчет
            </DialogTitle>
            <DialogContent>

                <DialogContentText>
                    {props.row.item}
                </DialogContentText>
                <DialogContentText>
                    {props.row.sum}
                </DialogContentText>
                <DialogContentText>
                    {props.row.ui_user_id}
                </DialogContentText>
                <DialogContentText>
                    {props.row.note}
                </DialogContentText>

            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.close()} color="primary">
                    Отказаться
                </Button>
                <Button onClick={() => {}} color="primary">
                    Попробовать
                </Button>
            </DialogActions>
        </Dialog>
        : ''

}

export default connect(state => state.app)(ImprestModal);