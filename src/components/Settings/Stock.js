import {Grid, Paper} from "@material-ui/core";
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

const mapDispatchToProps = dispatch => bindActionCreators({upd_app}, dispatch);

const Stock = props => {

    const [stock, setStock] = useState(() => props.app.stocks.find(s => s.id === +props.match.params.id))

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

        console.log(stock)

    }, [])

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

        <Grid item >
            {stock.name}
        </Grid>

        <Grid item >
            {stock.address}
        </Grid>

        <Grid item >
            {stock.phone_number}
        </Grid>

        {BottomButtons(save,
            reset,
            disabled,
            isNew
        )}

    </Grid>

}

export default connect(state => (state), mapDispatchToProps)(Stock)