import React, {useEffect, useState} from "react";
import {connect} from "react-redux";

import rest from "../components/Rest"
import {Typography} from "@material-ui/core";

import {useSnackbar} from "notistack";
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from "@material-ui/core/IconButton";

import {makeStyles} from '@material-ui/core/styles';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Consignment from "./Consignment";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    cons: {
        margin: '.5rem',
        backgroundColor: 'white',
        borderRadius: 5,
    }
}));

const Consignments = props => {

    const [cons, setCons] = useState()
    const [consignment, setConsignment] = useState()
    const [isConsignmentOpen, setIsConsignmentOpen] = useState(false)

    const {enqueueSnackbar} = useSnackbar()

    const init = () => {

        rest('consignments/' + props.app.current_stock_id)
            .then(res => {
                if (res.status === 200) {
                    setCons(res.body)
                }
            })

    }

    const del = ({provider_id, consignment_number}) => {

        rest('consignments/' + provider_id + '/' + consignment_number, 'DELETE')
            .then(res => {

                if (res.status === 200) {

                    enqueueSnackbar('Ок, Удалено!', {variant: 'success'})
                    init()

                } else {

                    enqueueSnackbar('Ошибка: ' + res.error[0], {variant: 'error'})

                }

            })

    }

    useEffect(() => {

        init()

// eslint-disable-next-line
    }, [])

    const classes = useStyles();

    const openCons = cons => {

        setConsignment(cons)
        setIsConsignmentOpen(true)

    }

    return isConsignmentOpen
        ? <Consignment
            close={() =>setIsConsignmentOpen(false)}
            consignment={consignment}
        />
        : cons && cons.length > 0
        ? <List className={classes.root}>
                {cons.map(c => <ListItem button className={classes.cons}
                                key={'consinview' + c.provider_id + c.consignment_number}
                                         onClick={() => openCons(c)}
            >
                    <ListItemText
                        primary={props.app.providers.find(p => p.id === +c.provider_id).name + ', №' + c.consignment_number}
                    />
                    <ListItemIcon>

                    <IconButton className="p-2 m-2"
                                onClick={() => del(c)}
                    >
                        <DeleteIcon color="secondary"/>
                    </IconButton>
                    </ListItemIcon>
                </ListItem>)}
        </List>
        : <Typography variant="h5">
            Сегодня не было накладных
        </Typography>

}

export default connect(state => state)(Consignments)