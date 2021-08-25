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

    const [item, setItem] = useState(props.row ? props.row.item : '')
    const [sum, setSum] = useState(props.row ? props.row.sum : 0)
    const [employee, setEmployee] = useState(props.row ? props.row.employee : 0)
    const [note, setNote] = useState(props.row ? props.row.note : '')

    useEffect(() => {

        console.log('props.row', props.row)

    }, [props.row])

    const exit = () => {

        setItem('')
        setSum(0)
        setEmployee(0)
        setNote('')

        props.close()

    }

    const del = id => {

        rest('imprest/' + props.stock_id + '/' + id, 'DELETE')
            .then(res => {
                if (res.status === 200) {
                    enqueueSnackbar('удален', {variant: 'success'})
                    exit()
                } else {
                    enqueueSnackbar('ошибка', {variant: 'error'})
                }
            })

    }

    const add = () => {

        rest('imprest/' + props.stock_id, 'POST', {
            item,
            sum,
            employee,
            note,
        })
            .then(res => {
                if (res.status === 200) {
                    enqueueSnackbar('внесен', {variant: 'success'})
                    exit()
                } else {
                    enqueueSnackbar('ошибка', {variant: 'error'})
                }
            })

    }

    const save = () => {

        console.log(props.row)

    }

    return <Dialog
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
                       value={item}
                       onChange={e => setItem(e.target.value)}
            />

            <TextField label="Сумма"
                       type="number"
                       disabled={props.disabled}
                       className={classes.field}
                       value={sum}
                       onChange={e => setSum(e.target.value)}
            />

            <UsersSelect
                classes={classes.field}
                disabled={props.disabled}
                users={props.users}
                user={employee}
                setUser={setEmployee}
                onlyValid={true}
            />

            <TextField label="Примечание"
                       disabled={props.disabled}
                       className={classes.field}
                       value={note}
                       onChange={e => setNote(e.target.value)}
            />

        </DialogContent>

        {props.disabled
            ? ''
            : <DialogActions>
                <Button onClick={() => props.row
                    ? del(props.row.id)
                    : props.close()}
                        color="secondary">
                    {props.row
                        ? 'Удалить'
                        : 'Отмена'}
                </Button>
                <Button onClick={() => props.row
                    ? save()
                    : add()}
                        color="primary">
                    {props.row
                        ? 'Сохранить'
                        : 'Внести'}
                </Button>
            </DialogActions>
        }

    </Dialog>

}

export default connect(state => state.app)(ImprestModal);