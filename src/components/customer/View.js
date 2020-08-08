import ReferalSelect from "../ReferalSelect";
import Field from "../Field";
import React, {useState} from "react";
import {connect} from "react-redux";

import {makeStyles} from "@material-ui/core/styles";
import {Button, Grid, Paper} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';


const types = {
  birthday: 'date',
  doc_date: 'date',
}

const useStyles = makeStyles(theme => ({
  button: {
    borderRadius: 3,
    margin: '1rem'
  }
}));

const View = props => {

  const [isDetails, setDetails] = useState(false)

  const classes = useStyles();

  return <Grid container component={Paper} spacing={1} justify="space-around">

    <Grid container
          style={{margin: '1rem'}}
          direction="row"
          justify="space-between"
    >
      <Grid item>
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

    <Grid item xs={12}>
      {
        props.allElements
          .filter(field => field.index === 'customer' && field.is_valid)
          .filter(field => isDetails || ['fio', 'phone_number'].includes(field.name))
          .map(field => field.name === 'referal_id'
            ? <ReferalSelect
              key={'customerfieldskey' + field.name}
              value={props.customer[field.name]}
              onChange={e => props.handleChange(field.name, e.target.value)}
            />
            : <Field
              key={'customerfieldskey' + field.name + field.index + field.value}
              type={types[field.name] || 'text'}
              label={field.value}
              value={props.customer[field.name]}
              onChange={e => props.handleChange(field.name, e.target.value)}
            />)
      }
    </Grid>

    <Grid item>
      <Button
        className={classes.button}
        variant="contained"
        size="small"
        color="secondary"
        onClick={() => props.reset()}
        disabled={props.disabled}
      >
        Отмена
      </Button>
      {props.customer.id === undefined
        ? <Button
          className={classes.button}
          variant="contained"
          size="small"
          color="primary"
          onClick={() => props.create()}
          disabled={props.disabled}
        >
          Создать
        </Button>
        : <Button
          className={classes.button}
          variant="contained"
          size="small"
          color="primary"
          onClick={() => props.update()}
          disabled={props.disabled}
        >
          Сохранить
        </Button>
      }
    </Grid>

  </Grid>

}

export default connect(state => state.app.fields)(View);
