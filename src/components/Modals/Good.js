import React, {forwardRef, useState} from "react";
import {connect} from "react-redux";

import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import {makeStyles} from "muiLegacyStyles";

import GoodActions from "../Good/GoodActions";
import GoodContent from "../Good/GoodContent";
import {createDate} from "../common/Print";
import store from "../../store";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
        padding: '1rem 4.75rem 1rem 1.2rem !important',
        borderBottom: '1px solid rgba(144, 160, 176, 0.22)',
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1.25),
        top: theme.spacing(1.15),
        color: theme.palette.grey[500],
        zIndex: 2,
    },
}));


const Good = props => {

    const classes = useStyles()

    // 0 - normal
    // 1 - repair
    // 2 - history
    const [statusId, setStatusId] = useState(0)

    const good = props.app.good
    const stock = props.app.stocks.find(s => s.id === good.stock_id)

    const alias = {
            organization_organization: props.app.organization.organization,
            organization_name: props.app.organization.name,
            organization_legal_address: props.app.organization.legal_address,
            organization_inn: props.app.organization.inn,
            access_point_address: stock.address || '',
            access_point_phone_number: stock.phone_number || '',
            today: createDate(good.wo ? good.outtime : null),
            model: good.model,
            imei: good.imei,
            sum: good.sum,
        }

    const close = (barcode = '') => {

        setStatusId(0)
        store.dispatch({type: 'CLOSE_GOOD'})
        if (barcode) store.dispatch({
            type: 'DELETE_GOOD',
            barcode
        })

    }

    return <Dialog
        open={!!good}
        slots={{ transition: Transition }}
        onClose={() => close()}
        className='non-printable'
        fullWidth
        maxWidth="sm"
    >

        <DialogTitle className={`${classes.dialogTitle} good-dialog-titlebar`}>

            <GoodActions
                statusId={statusId}
                setStatusId={setStatusId}
                alias={alias}
            />

            <IconButton aria-label="close" className={`${classes.closeButton} good-dialog-close-button`}
                        onClick={() => close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <GoodContent
            statusId={statusId}
            setStatusId={setStatusId}
            close={close}
            alias={alias}
        />

    </Dialog>

}

export default connect(state => state)(Good)
