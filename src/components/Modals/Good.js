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

    if (!(props.good && props.good.id)) return '';

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

            {'#' + props.good.id}

            {<span style={{
                position: "absolute",
                right: "50px"
            }}>

            <GoodActions
                good={props.good}
                setGood={props.setGood}
                isRepair={isRepair}
                setIsRepair={setIsRepair}
                open={open}
            />

            </span>}

            <IconButton aria-label="close" className={classes.closeButton}
                        onClick={() => props.close()}>
                <CloseIcon/>
            </IconButton>

        </DialogTitle>

        <GoodContent
            good={props.good}
            isRepair={isRepair}
            setIsRepair={setIsRepair}
        />

    </Dialog>

}

export default connect(state => (state))(Good)