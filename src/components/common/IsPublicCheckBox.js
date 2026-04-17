import React from "react";
import * as PropTypes from "prop-types";

import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default function IsPublicCheckBox(props) {
    return <FormControlLabel
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
