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

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Stock = props => {

    const [stock, setStock] = useState(() => props.app.stocks.find(s => s.id === +props.match.params.id))

    const [allowedUserIds, setAllowedUserIds] = useState(() => props.app.stockusers
        .filter(su => su.stock_id === +props.match.params.id)
        .map(su => su.user_id))

    const isNew = +props.match.params.id > 0
    const disabled = stock === props.app.stocks.find(s => s.id === +props.match.params.id)

    const save = () => {
        console.log('save')
    }

    const reset = () => {
        console.log('reset')
    }

    const remove = () => {
        console.log('remove')
    }

    useEffect(() => {

        console.log(allowedUserIds)

    }, [allowedUserIds])

    const checkHandler = (user_id, isAllowed) => setAllowedUserIds(prev => {

        const state = {...prev}

            rest('stockusers/' + stock.id + '/' + user_id,
                isAllowed
                    ? 'POST'
                    : 'DELETE'
            )
                .then(res => {

                    console.log(res)

                    if (!res.status || res.status > 299) {

                        setAllowedUserIds(state)

                    }

                })

            return isAllowed
                ? prev.concat(user_id)
                : prev.filter(v => v !== user_id)
        }
    )

    return <Grid container
                 component={Paper}
                 spacing={1}
                 direction="column"
                 alignItems="center"
                 justify="space-around"
                 style={{width: '100%'}}
    >

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
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>

        <Grid item>
            {stock.name}
        </Grid>

        <Grid item>
            {stock.address}
        </Grid>

        <Grid item>
            {stock.phone_number}
        </Grid>

        <Grid item>
            <Typography variant="h5">
                Сотрудники:
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
            disabled,
            isNew
        )}

    </Grid>

}

export default connect(state => (state), mapDispatchToProps)(Stock)