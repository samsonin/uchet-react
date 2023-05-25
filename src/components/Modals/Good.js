import React, {forwardRef, useEffect, useState} from "react";
import {connect} from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import {makeStyles} from "@material-ui/core/styles";

import rest from "./../Rest";
import GoodActions from "../Good/GoodActions";
import GoodContent from "../Good/GoodContent";
import {createDate} from "../common/Print";
import store from "../../store";


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

    const close = () => {

        setIsHistory(false)
        setIsRepair(false)

        store.dispatch({type: 'CLOSE_GOOD'})

    }

    return <Dialog
        open={true}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => close()}
        className='non-printable'
        fullWidth
    >

        <DialogTitle>

            <GoodActions
                good={good}
                setGood={props.setGood}
                isRepair={isRepair}
                setIsRepair={setIsRepair}
                isHistory={isHistory}
                setIsHistory={setIsHistory}
                close={close}
                alias={alias}
            />

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <GoodContent
            good={good}
            setGood={props.setGood}
            isRepair={isRepair}
            isHistory={isHistory}
            setIsRepair={setIsRepair}
            close={close}
            alias={alias}
        />

    </Dialog>

}

export default connect(state => state)(Good)