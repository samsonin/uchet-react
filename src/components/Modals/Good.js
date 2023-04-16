import React, {forwardRef, useState} from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import {makeStyles} from "@material-ui/core/styles";

import GoodActions from "../Good/GoodActions";
import GoodContent from "../Good/GoodContent";
import {createDate} from "../common/Print";


const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
}));


const Good = props => {

    const classes = useStyles()

    const [isRepair, setIsRepair] = useState(false)
    const [isHistory, setIsHistory] = useState(false)

    if (!(props.good && props.good.id)) return '';

    const stock = props.app.stocks.find(s => s.id === props.good.stock_id)

    const alias = {
        organization_organization: props.app.organization.organization,
        organization_name: props.app.organization.name,
        organization_legal_address: props.app.organization.legal_address,
        organization_inn: props.app.organization.inn,
        access_point_address: stock.address || '',
        access_point_phone_number: stock.phone_number || '',
        today: createDate(props.good.wo ? props.good.outtime : null),
        model: props.good.model,
        imei: props.good.imei,
        sum: props.good.sum,
    }

    const open = () => {

        window.open('goods/' + props.good.barcode, "_blank")

        props.close()

    }

    return <Dialog
        open={!!(props.good ?? props.good.id)}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => props.close()}
        className='non-printable'
        fullWidth
    >

        <DialogTitle>

            <GoodActions
                good={props.good}
                setGood={props.setGood}
                isRepair={isRepair}
                setIsRepair={setIsRepair}
                isHistory={isHistory}
                setIsHistory={setIsHistory}
                open={open}
                close={props.close}
                alias={alias}
            />

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <GoodContent
            good={props.good}
            setGood={props.setGood}
            isRepair={isRepair}
            isHistory={isHistory}
            setIsRepair={setIsRepair}
            close={props.close}
            alias={alias}
        />

    </Dialog>

}

export default connect(state => state)(Good)