import React from 'react';
import {FormControl, Select, MenuItem} from "@material-ui/core";
import {connect} from "react-redux";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";


const ReferalSelect = props => {

  return typeof props.referals === 'object'
    ? <FormControl
      style={{
        width: '100%',
        padding: '1rem',
      }}
    >
      <InputLabel>Источник информации о нас</InputLabel>
      <Select
        value={props.value}
        onChange={props.onChange}
      >
        {props.referals.filter(item => item.is_valid)
          .map(item => < MenuItem
            key={'sreferalsselextksertjrf' + item.id}
            value={item.id}
          >
            {item.name}
          </MenuItem>)}
      </Select>
    </FormControl>
    : null

}

export default connect(state => state.app)(ReferalSelect);
