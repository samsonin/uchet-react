import React, {useState, useEffect} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from "@material-ui/core/TextField/TextField";
import {Paper} from "@material-ui/core";

import {useSnackbar} from 'notistack';

import rest from "./Rest";
import {BottomButtons} from "./common/BottomButtons";


const Entity = props => {

    const [isRequesting, setRequesting] = useState(false)
    const [isDetails, setDetails] = useState(false)

    const id = +props.match.params.id;

    const serverEntity = {...props.providers.find(p => p.id === id)}

    const [entity, setEntity] = useState(() => serverEntity)

    const [disabled, setDisabled] = useState(true)

    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {

        setDisabled(isRequesting ||
            JSON.stringify(props.providers.find(p => p.id === id)) === JSON.stringify(entity))

    },[entity, isRequesting])

    const fieldHandler = (name, value) => {
        setEntity(prev => ({...prev, [name]: value}))
    }

    const cancel = () => setEntity(serverEntity)

    const save = () => {

        if (isRequesting) return;

        setRequesting(true)

        rest('entities/' + (entity.id || ''),
            entity.id
                ? 'PUT'
                : 'POST',
            entity
        ).then(res => {

            setRequesting(false)

            if (res.ok) {

                if (entity.id) {

                    enqueueSnackbar('Сохранено', {
                        variant: 'success',
                    });

                } else {

                    setEntity(null)
                    enqueueSnackbar('Создан', {
                        variant: 'success',
                    });
                    props.history.push('/entities')

                }
            }

        })

    }

    const remove = () => {

        if (isRequesting) return;

        setRequesting(true)

        rest('entities/' + entity.id, 'DELETE')
            .then(res => {

                setRequesting(false)

                if (res.ok) {
                    setEntity(null)
                    enqueueSnackbar('Удалено', {
                        variant: 'success',
                    });
                    props.history.push('/entities')
                } else {
                    enqueueSnackbar('Невозможно удалить', {
                        variant: 'error',
                    });
                }


            })

    }

    // console.log(entity)

    return <Grid container
                component={Paper}
                direction="row"
                justify="space-between"
                style={{
                    padding: '1rem'
                }}
        >
            <Grid item>
                <Tooltip title={'Все юр. лица'}>
                    <Link to="/entities">
                        <IconButton>
                            <ArrowBackIcon/>
                        </IconButton>
                    </Link>
                </Tooltip>
            </Grid>
            <Grid item>
                <IconButton
                    disabled={isRequesting ||
                    JSON.stringify(props.providers.find(p => p.id === id)) === JSON.stringify(entity)
                    }
                    onClick={() => remove()}
                >
                    <Tooltip title="Удалить">
                        <DeleteIcon/>
                    </Tooltip>

                </IconButton>
                <Tooltip title={
                    isDetails
                        ? 'Кратко'
                        : 'Подробно'
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

            {entity
                ? props.fields.allElements
                    .filter(elem => elem.index === 'entity' && elem.is_valid)
                    .filter(field => isDetails || ['name', 'inn'].includes(field.name))
                    .map(elem => {

                            return <TextField
                                style={{
                                    width: '100%',
                                    margin: '1rem',
                                    padding: '1rem',
                                }}
                                key={'entityfieldskey' + elem.id}
                                label={elem.value}
                                value={entity[elem.name]}
                                disabled={elem.name === 'saldo'}
                                onChange={e => fieldHandler(elem.name, e.target.value)}
                            />
                        }
                    )
                : null}

            {BottomButtons(save, cancel, disabled, !id)}

        </Grid>

}

export default connect(state => state.app)(Entity);
