import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import * as PropTypes from "prop-types";
import React from "react";

export default function IsPublicCheckBox(props) {
    return props.onlyBox
        ? <Checkbox
            checked={props.value}
            onChange={props.onChange}
            color="primary"
        />
        : <FormControlLabel
            style={{
                margin: '1rem .3rem',
                width: '95%'
            }}
            control={
                <Checkbox
                    checked={props.value}
                    onChange={props.onChange}
                    color="primary"
                />
            }
            label="Опубликовать в интернете"
        />
}

IsPublicCheckBox.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.bool
};
