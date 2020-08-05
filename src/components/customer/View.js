import {Button, Grid, Paper, Typography} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ReferalSelect from "../ReferalSelect";
import Field from "../Field";
import React, {useState} from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {enqueueSnackbar, upd_app} from "../../actions/actionCreator";
import styled from "@material-ui/core/styles/styled";


const MyButton = styled(Button)({
  borderRadius: 3,
  margin: '1rem'
});

const types = {
  birthday: 'date',
  doc_date: 'date',
}

const View = props => {

  const [isDetails, setDetails] = useState(false)

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
      <MyButton
        variant="contained"
        color="secondary"
        size="small"
        onClick={() => props.reset()}
        disabled={props.disabled}
      >
        Отмена
      </MyButton>
      {props.customer
        ? <MyButton
          variant="contained"
          color="primary"
          size="small"
          onClick={() => props.create()}
          disabled={props.disabled}
        >
          Создать
        </MyButton>
        : <MyButton
          variant="contained"
          color="primary"
          size="small"
          onClick={() => props.update()}
          disabled={props.disabled}
        >
          Сохранить
        </MyButton>
      }
    </Grid>
  </Grid>

}

export default connect(state => state.app.fields)(View);
