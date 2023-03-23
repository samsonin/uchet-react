import React from "react";
import {connect} from "react-redux";

import {TextField, Typography} from "@material-ui/core";

import CategoryHandler from "./common/CategoryHandler";


const EnteredGood = props => {

    const style = {
        width: '100%',
        margin: '.5rem',
        padding: '.5rem'
    }

    const tf = (l, v, o) => <TextField variant="outlined"
                                       style={style}
                                       label={l}
                                       value={v}
                                       onChange={e => o(e.target.value)}
    />


    return <div style={{
        border: '1px solid black',
        borderRadius: '5px',
        padding: '.5rem'
    }}>

        <Typography variant="subtitle2">
            Что изготовим:
        </Typography>

        <div style={style}>

            <CategoryHandler
                id={props.category_id}
                setId={props.setCategory_id}
            />

        </div>

        {tf("Наименование", props.model, props.setModel)}

        {tf("imei", props.imei, props.setImei)}

    </div>

}

export default connect(state => state)(EnteredGood)