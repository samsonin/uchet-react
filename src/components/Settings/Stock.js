import {Grid, Paper, Typography} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {Link} from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import DeleteIcon from "@material-ui/icons/Delete";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {upd_app} from "../../actions/actionCreator";
import {BottomButtons} from "../common/BottomButtons";
import {List} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";

import rest from "../Rest";
import TextField from "@material-ui/core/TextField/TextField";
import {useSnackbar} from "notistack";

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Stock = props => {

    const initialStock = props.app.stocks.find(s => s.id === +props.match.params.id)

    const [isRequest, setIsRequest] = useState(false)

    const [stock, setStock] = useState(() => initialStock)

    const [allowedUserIds, setAllowedUserIds] = useState(() => props.app.stockusers
        .filter(su => su.stock_id === +props.match.params.id)
        .map(su => su.user_id))

    const {enqueueSnackbar} = useSnackbar();

    const fieldHandler = (name, value) => setStock(prev => ({...prev, [name]: value}))

    const save = () => {

        setIsRequest(true)

        rest('stocks/' + stock.id, 'PATCH', {
            name: stock.name,
            address: stock.address,
            phone_number: stock.phone_number,
        })
            .then(res => {

                setIsRequest(false)

                if (res.status < 300) {
                    const {upd_app} = props;
                    upd_app(res.body)

                    enqueueSnackbar('ok', {variant: 'success'})
                }

            })

    }

    const reset = () => setStock(initialStock)

    const remove = () => {

        setIsRequest(true)

        rest('stocks/' + stock.id, 'DELETE')
            .then(res => {

                setIsRequest(false)

                if (res.status < 300) {
                    const {upd_app} = props;
                    upd_app(res.body)

                    enqueueSnackbar('ok', {variant: 'success'})

                    props.history.push('/stocks')
                }

            })
    }

    useEffect(() => {


    }, [allowedUserIds])

    const checkHandler = (user_id, isAllowed) => setAllowedUserIds(prev => {

        const state = {...prev}

        rest('stockusers/' + stock.id + '/' + user_id, isAllowed
            ? 'POST'
            : 'DELETE'
        )
            .then(res => {

                return res.status && res.status < 300
                        ? true
                        : setAllowedUserIds(state)
                }
            )

        return isAllowed
            ? prev.concat(user_id)
            : prev.filter(v => v !== user_id)
    })

    return <Grid container component={Paper} spacing={1} justify="space-around">

        <Grid container
              style={{margin: '1rem'}}
              justify="space-between"
        >
            <Grid item>
                <Tooltip title={'Все точки'}>
                    <Link to="/settings/stocks">
                        <IconButton>
                            <ArrowBackIcon/>
                        </IconButton>
                    </Link>
                </Tooltip>
            </Grid>
            <Grid item>
                <Tooltip title="Удалить">
                    <IconButton
                        onClick={() => remove()}
                        disabled={isRequest}
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>

        {[
            {name: 'name', value: 'Название'},
            {name: 'address', value: 'Адрес'},
            {name: 'phone_number', value: 'Номер телефона'}]
            .map(field => <TextField
                key={'maptextfieldinstock' + field.name}
                style={{
                    width: '100%',
                    padding: '1rem',
                }}
                label={field.value}
                value={stock[field.name] || ''}
                onChange={e => fieldHandler(field.name, e.target.value)}
            />)}

        <Grid item>
            <Typography variant="h6">
                Допуск сотрудников:
            </Typography>
            <List dense>

                {props.app.users
                    .filter(u => u.is_valid)
                    .map(u => {

                        // console.log(u.id, allowedUserIds.includes(u.id))

                        return <ListItem key={'userstockslistitem' + u.id} button>
                            <ListItemText primary={u.name}/>
                            <ListItemSecondaryAction>
                                <Checkbox
                                    edge="end"
                                    onChange={e => checkHandler(u.id, e.target.checked)}
                                    checked={allowedUserIds.includes(u.id)}
                                    // inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    })
                }
            </List>
        </Grid>

        {BottomButtons(save,
            reset,
            isRequest || (JSON.stringify(stock) === JSON.stringify(initialStock)),
            !+props.match.params.id
        )}

    </Grid>

}

export default connect(state => (state), mapDispatchToProps)(Stock)