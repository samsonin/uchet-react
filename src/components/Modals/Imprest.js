import React, {forwardRef, useEffect, useState} from "react";

import rest from "../../components/Rest";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CloseIcon from '@material-ui/icons/Close';
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import {useSnackbar} from "notistack";
import {connect} from "react-redux";
import TextField from "@material-ui/core/TextField/TextField";
import UsersSelect from "../common/UsersSelect";
import {makeStyles} from '@material-ui/core/styles';
import IconButton from "@material-ui/core/IconButton";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    field: {
        margin: '1rem .3rem',

        width: '95%'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    }
}));

const ImprestModal = props => {

    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar()

    console.log(props.row)

    const del = id => {

        rest('imprest/' + props.stock_id + '/' + id, 'DELETE')
            .then(res => {

                if (res.ok) {
                    enqueueSnackbar('удален', {variant: 'success'})
                    props.close()
                } else {
                    enqueueSnackbar('error', {variant: 'error'})
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
                Подотчет

                <IconButton aria-label="close" className={classes.closeButton} onClick={() => props.close()}>
                    <CloseIcon/>
                </IconButton>

            </DialogTitle>
            <DialogContent>

                <TextField label="Наименование"
                           disabled={props.disabled}
                           className={classes.field}
                           value={props.row.item}
                           onChange={e => console.log(e.target.value)}
                />

                <TextField label="Сумма"
                           disabled={props.disabled}
                           className={classes.field}
                           value={props.row.sum}
                           onChange={e => console.log(e.target.value)}
                />

                <UsersSelect
                    classes={classes.field}
                    disabled={props.disabled}
                    users={props.users}
                    user={props.row.ui_user_id}
                    onlyValid={true}
                />

                <TextField label="Примечание"
                           disabled={props.disabled}
                           className={classes.field}
                           value={props.row.note}
                           onChange={e => console.log(e.target.value)}
                />

            </DialogContent>

            {props.disabled
                ? ''
                : <DialogActions>
                    <Button onClick={() => del(props.row.id)} color="secondary">
                        Удалить
                    </Button>
                    <Button onClick={() => {
                    }} color="primary">
                        Сохранить
                    </Button>
                </DialogActions>}

        </Dialog>
        : ''

}

export default connect(state => state.app)(ImprestModal);