import React, {Fragment} from "react";
import {connect} from "react-redux";
import {Divider, IconButton, Link, List, ListItem, ListItemIcon, ListItemText, Paper} from "@material-ui/core";
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import {useSnackbar} from "notistack";

const Prices = props => {

    const {enqueueSnackbar} = useSnackbar()

    const url = 'https://api.uchet.store/prices/' + props.auth.organization_id + '/'

    const stocks = props.app.stocks.filter(s => s.is_valid)

    const stopId = stocks[stocks.length - 1].id

    return <List component={Paper}>

        {stocks.map(s => <Fragment key={'stocksinpriceskey' + s.id}>
                <ListItem>
                    <ListItemText
                        primary={s.name}
                    />
                    <Link style={{
                        margin: '1rem'
                    }}
                          href={url + s.id}>
                        {url + s.id}
                    </Link>
                    <ListItemIcon>
                        <IconButton onClick={() => window.navigator.clipboard
                            .writeText(url + s.id)
                            .then(() => enqueueSnackbar('скопированно в буфер', {
                                variant: 'success',
                            }))
                            .catch(() => enqueueSnackbar('не скопировалось', {
                                variant: 'error'
                            }))
                        }>
                            <FileCopyOutlinedIcon/>
                        </IconButton>
                    </ListItemIcon>
                </ListItem>
            {stopId === s.id || <Divider variant="inset" component="li"/>}
            </Fragment>)}

    </List>

}

export default connect(state => state)(Prices)