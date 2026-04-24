import React, {useState} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {Grid, Paper} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from "@mui/icons-material/Delete";

import ReferalSelect from "../ReferalSelect";
import {BottomButtons} from "../common/BottomButtons";
import TextField from "@mui/material/TextField";
import PassportUploadButton from "./PassportUploadButton";

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
            <PassportUploadButton
                visible={!props.customer.id && isDetails}
                customer={props.customer}
                setCustomer={props.setCustomer}
                className="customer-view-passport-upload"
            />
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
