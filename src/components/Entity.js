import React, {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TextField from "@material-ui/core/TextField/TextField";
import {Paper} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles(theme => ({
  button: {
    borderRadius: 3,
    margin: '1rem'
  }
}));

let serverEntity;

const Entity = (props) => {

  const [isDetails, setDetails] = useState(false)
  const [entity, setEntity] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const classes = useStyles();

  useEffect(() => {

    serverEntity = id > 0
      ? props.providers.find(p => p.id === id)
      : null

    setEntity({...serverEntity})

  }, [])

  let id = +props.match.params.id;

  const fieldHandler = (name, value) => {

    console.log(name)

    entity[name] = value;

    setEntity(prev => {
      return {...prev, [name]: value}
    })

    setDisabled(JSON.stringify(serverEntity) === JSON.stringify(entity))

  }

  const cancel = () => {

    setEntity({...serverEntity})
    setDisabled(true)

  }

  const save = () => {

    console.log(entity)

  }

  return props.fields.allElements
    ? <Grid container
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
          .map(elem => {

              // if (elem.name === 'entity_name') console.log(elem)

              return <TextField
                style={{
                  width: '100%',
                  margin: '1rem',
                  padding: '1rem',
                }}
                key={'entityfieldskey' + elem.id}
                label={elem.value}
                value={id > 0
                  ? elem.name === 'entity_name'
                    ? entity.name
                    : entity[elem.name]
                  : ''}
                disabled={elem.name === 'saldo'}
                onChange={e => fieldHandler(elem.name, e.target.value)}
              />
            }
          )
        : null}

      <Grid container
            direction="row"
            justify="space-evenly"
      >
        <Button
          variant="contained"
          size="small"
          color="secondary"
          onClick={() => cancel()}
          disabled={disabled}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => save()}
          disabled={disabled}
        >
          {id > 0
            ? 'Сохранить'
            : 'Создать'}
        </Button>
      </Grid>

    </Grid>

    : null
}

export default connect(state => state.app)(Entity);
