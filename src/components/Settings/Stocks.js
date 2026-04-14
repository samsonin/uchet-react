import React from "react";
import { connect } from "react-redux";

import { useSnackbar } from 'notistack';

import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Switch,
    Typography
} from "@material-ui/core";

import rest from '../../components/Rest';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import AddCircleIcon from "@material-ui/icons/AddCircle";

const useStyles = makeStyles({
    root: {
        width: '100%',
        margin: '0.5rem',
    },
    cardHeader: {
        backgroundColor: '#F7F7F7',
        borderBottom: '1px solid #e9ecef',
    },
    stockItem: {
        cursor: 'pointer',
        borderBottom: '1px solid #e9ecef',
        '&:last-child': {
            borderBottom: 0,
        },
        '&:hover': {
            backgroundColor: '#F7F7F7',
        },
    },
    stockIcon: {
        minWidth: 42,
    },
})

const Stocks = props => {

    const [isRequest, setIsRequest] = React.useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const classes = useStyles();
    const stocks = props.stocks || [];

    const handleResponse = (res, successText = 'ok') => {
        setIsRequest(false);

        enqueueSnackbar(res.status < 300 ? successText : 'error', {
            variant: res.status < 300 ? 'success' : 'error'
        })
    }

    const add = () => {

        if (!isRequest) {
            setIsRequest(true);
            rest('stocks', 'POST')
                .then(res => handleResponse(res));
        }
    }

    const isValidToggleHandler = (id, value) => {

        if (!isRequest) {

            setIsRequest(true);
            rest('stocks/' + id, 'PATCH', {
                is_valid: value
            })
                .then(res => handleResponse(res))
        }
    };

    return <div className={classes.root}>
        <Card>
            <CardHeader
                title="Точки"
                className={classes.cardHeader}
                titleTypographyProps={{ variant: "h5" }}
                action={
                    <Tooltip title="Добавить">
                        <span>
                            <IconButton onClick={add} disabled={isRequest}>
                                <AddCircleIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                }
            />
            <CardContent>
                {stocks.length
                    ? <List disablePadding>
                        {stocks.map(stock => <ListItem
                            button
                            className={classes.stockItem}
                            onClick={() => props.history.push('/settings/stocks/' + stock.id)}
                            key={"conteinerinstockgrid" + stock.id}
        >
                            <ListItemIcon className={classes.stockIcon}>
                                <Typography variant="h6">
                                    <i className="fas fa-store" />
                                </Typography>
                            </ListItemIcon>
                            <ListItemText primary={stock.name} />
                            <ListItemSecondaryAction>
                                <Tooltip title={stock.is_valid ? "Отключить" : "Включить"}>
                                    <Switch
                                        checked={!!stock.is_valid}
                                        disabled={isRequest}
                                        onClick={e => e.stopPropagation()}
                                        onChange={e => isValidToggleHandler(stock.id, e.target.checked)}
                                        color="primary"
                                    />
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>)}
                    </List>
                    : <Grid container justify="center">
                        <Typography variant="body1">
                            Точки не добавлены
                        </Typography>
                    </Grid>}
            </CardContent>
        </Card>
    </div>

}

export default connect(state => state.app)(Stocks)