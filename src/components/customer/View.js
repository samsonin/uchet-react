import React, {useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {Grid, Paper} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import DeleteIcon from "@material-ui/icons/Delete";

import ReferalSelect from "../ReferalSelect";
import {BottomButtons} from "../common/BottomButtons";
import TextField from "@material-ui/core/TextField/TextField";

const types = {
    birthday: 'date',
    doc_date: 'date',
}

const View = props => {

    const [isDetails, setDetails] = useState(false)

    return <Grid container component={Paper} spacing={1} justify="space-around">

        {props.remove
            ? <Grid container
                    style={{margin: '1rem'}}
                    justify="space-between"
            >
                <Grid item>
                    <Tooltip title={'Все физ. лица'}>
                        <Link to="/customers">
                            <IconButton>
                                <ArrowBackIcon/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                </Grid>
                <Grid item>
                    <Tooltip title="Удалить">
                        <IconButton
                            onClick={() => props.remove()}
                        >
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={
                        isDetails
                            ? ''
                            : 'Подробнее'
                    }>
                        <IconButton
                            onClick={() => setDetails(!isDetails)}
                        >
                            {isDetails
                                ? <ExpandLessIcon/>
                                : <ExpandMoreIcon/>
                            }
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
            : null}

        <Grid item xs={12}>
            {props.allElements
                    .filter(field => field.index === 'customer' && field.is_valid)
                    .filter(field => isDetails || ['fio', 'phone_number'].includes(field.name))
                    .map(field => {

                            // console.log(props.customer[field.name])

                            return field.name === 'referal_id'
                                ? <ReferalSelect
                                    key={'customerfieldskey' + field.name}
                                    value={props.customer[field.name]}
                                    onChange={e => props.handleChange(field.name, e.target.value)}
                                />
                                : <TextField
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                    }}
                                    key={'customerfieldskey' + field.name + field.index + field.value}
                                    type={types[field.name] || 'text'}
                                    label={field.value}
                                    value={props.customer[field.name] || ''}
                                    onChange={e => props.handleChange(field.name, e.target.value)}
                                />
                        }
                    )
            }
        </Grid>

        {props.remove
            ? BottomButtons(props.customer.id === undefined
                ? props.create
                : props.update,
                props.reset,
                props.disabled,
                props.customer.id === undefined
            )
            : null}

    </Grid>

}

export default connect(state => state.app.fields)(View);
